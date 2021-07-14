import { SbStorageService } from './../../../services/sb-storage.service';
import { first } from 'rxjs/operators';
import {
  Component,
  OnInit,
  ViewChild,
  Input,
  ViewEncapsulation,
  ElementRef,
  OnDestroy,
  HostListener
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  FormlyFormOptions,
  FormlyFieldConfig,
  FormlyForm
} from '@ngx-formly/core';
import * as dot from 'dot-prop';
import { HttpClient } from '@angular/common/http';
import { Message, ConfirmationService } from 'primeng/api';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import {
  FormConfigContext,
  FormType,
  FieldDefaultValue,
  FormValueSourceEnum
} from 'src/app/sb-form-configuration/sb-form-context';
import {
  transformModel,
  updateCopyFields,
  getObjectDotPath,
  calculateFields,
  getFormComponentItemtext,
  setObject,
  deepCopy
} from 'src/app/utils';
import uuidv4 from 'uuid/v4';
import { getDateFromOffset, jsonParseDateSerializer } from 'src/app/date-utils';
import { SbHost } from 'src/model/sb-host-enum';
import { environment } from 'src/environments/environment';
import { SbDataService } from 'src/services/sb-data.service';
import { SbEventBusService } from 'src/services/sb-event-bus.service';
import { SbEventTopic } from 'src/services/sb-event-topic';
import { SbEvent } from 'src/services/sb-event';
import { SbPropertiesService } from 'src/services/sb-properties.service';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';

import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SbConfirmDialogComponent } from 'src/app/sb-confirm-dialog/sb-confirm-dialog.component';
import { Sbmessage } from 'src/model/sb-messages';
import { MatFormFieldDefaultOptions, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { SbPrintService } from 'src/services/sb-print.service';

// set default form field appearance as fill for this component
const appearance: MatFormFieldDefaultOptions = {
  appearance: 'outline'
};
@Component({
  selector: 'app-sb-form-widget',
  templateUrl: './sb-form-widget.component.html',
  styleUrls: ['./sb-form-widget.component.scss'],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: appearance
    }
  ],
  encapsulation: ViewEncapsulation.None
})
export class SbFormWidgetComponent implements OnInit, OnDestroy {
  @Input() context: FormConfigContext;
  @ViewChild('filterSaveTextBox') filterSaveTextbox: ElementRef;
  @ViewChild('formlyForm', { static: true }) formlyForm: FormlyForm;

  form = new FormGroup({});
  /** An optional model object bound to the form */
  model = {};
  fields: FormlyFieldConfig[];
  options: FormlyFormOptions = {};
  msgs: Sbmessage[] = [];
  formConfigContext: FormConfigContext;
  /** Optional id of entity to be updated */
  entityId: any;
  /** Subscribe to model changes */
  modelSubscription: any;
  debug: boolean;
  routeParams: ParamMap;
  savedFilters: { name: string; model: any }[];
  enteredFilterName: string;
  filterSaveDisabled = true;
  filterSaveButtonDisabled = true;
  activeFilterName = '';
  isPrinting = false;
  subscription: Subscription;
  submitSubscription: Subscription;
  cancelSubscription: Subscription;
  public clientName: string =environment.client.clientName; // imported from environments.ts
  public printLayout: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private dataService: SbDataService,
    private eventBus: SbEventBusService,
    private propertiesService: SbPropertiesService,
    private confirmationService: ConfirmationService,
    private storageService: SbStorageService,
    private location: Location,
    public dialog: MatDialog,
    private printService: SbPrintService
  ) {
    this.entityId = route.snapshot.paramMap.get('id');
    this.debug = environment.debug;
    this.route.queryParamMap.subscribe(queryParamMap => {
      this.routeParams = queryParamMap;
    });
  }

  /*** Could've done this through css but innerhtml for print div is evaluated even through component has display:none set ***/
  @HostListener('window:beforeprint', ['$event'])
  onBeforePrint(event) {
    this.isPrinting = true;
  }
  @HostListener('window:afterprint', ['$event'])
  onAfterPrint(event) {
    this.isPrinting = false;
  }

  ngOnInit(): void {
    this.formConfigContext = this.context;
    this.fields = this.formConfigContext.formlyFieldConfigs;
    this.options = this.formConfigContext.options;

    this.model = transformModel(
      this.formConfigContext.model,
      true,
      this.formConfigContext.formModelMapping
    );

    this.initDefaultValues(this.getStoredFormModel(), this.model);
    this.initCalculatedFields();
    this.savedFilters = this.getSavedSearchFilters();
    this.registerPrintListener();
  }

  ngOnDestroy(): void {
    this.eventBus.emitEmpty(this.context.formId, SbEventTopic.FormFiltered);
    this.subscription.unsubscribe();
    this.dialog.closeAll();
  }

  // Integrated Material Confirm Dialog
  openDialog(model) {
    const dialogRef = this.dialog.open(SbConfirmDialogComponent, {
      width: '500px',
      hasBackdrop: true,
      disableClose: true,
      data: {
        title: 'Confirmation',
        message: this.getPrettyPrintedFormValues(),
        cancelText: `Cancel`,
        confirmText: `Submit`
      }
    });
    this.submitSubscription = dialogRef.componentInstance.submitConfirm
      .subscribe(data => {
        this.submitForm(model, true);
      });
    this.cancelSubscription = dialogRef.componentInstance.cancelConfirm
      .subscribe(data => {
        this.form.enable({ emitEvent: false });
      });
    dialogRef.afterClosed().subscribe(() => {
      this.submitSubscription.unsubscribe();
      this.cancelSubscription.unsubscribe();
    });
  }

  // resetConfirmDialog() {
  //   this.form.enable({ emitEvent: false });
  // }

  getSavedSearchFilters(): { name: string; model: any }[] {
    const storedFilters = this.storageService.localGet(
      this.context.formId,
      'filters'
    );
    return storedFilters ? storedFilters : [];
  }

  private initCalculatedFields() {
    if (!this.formConfigContext.calculatedFields) {
      return;
    }
    this.formConfigContext.calculatedFields.forEach(calculatedField => {
      for (const [key, fieldTarget] of Object.entries(calculatedField.fields)) {
        const field = getObjectDotPath(fieldTarget, this.fields);
        if (field && !field.templateOptions.change) {
          field.templateOptions.change = Function(
            'field',
            '$event',
            'this.calculate($event, field)'
          ).bind(this);
        }
      }
    });
  }

  private initDefaultValues(storedModel: any, modelToUpdate: any): void {
    if (!this.formConfigContext.defaultValues || this.entityId) {
      return;
    }
    const values = this.formConfigContext.defaultValues;
    const targetValues = values.map(dfv => {
      const defaultValue = this.getValueFromDefault(dfv, storedModel);
      const formattedDefaultValue = this.formatDefaultValue(defaultValue, dfv);
      return { value: formattedDefaultValue, target: dfv.target };
    });
    targetValues.forEach(tv => {
      if (tv.value) {
        setObject(tv.target, tv.value, modelToUpdate);
      }
    });
  }

  private formatDefaultValue(value: any, dfv: FieldDefaultValue): any {
    if (dfv.dateOffset) {
      // todo - why doesn't this work? (value && typeof value === 'Date')
      return getDateFromOffset(dfv.dateOffset, value ? value : new Date());
    } else if (value === 'UUID') {
      return uuidv4();
    }
    return value;
  }

  private getStoredFormModel(): any {
    return this.storageService.localGet(this.context.formId, 'lastused');
  }

  private getValueFromDefault(dfv: FieldDefaultValue, storedModel: any): any {
    switch (dfv.valueSource) {
      case FormValueSourceEnum.Route: {
        return this.routeParams.get(dfv.sourcePath);
      }
      case FormValueSourceEnum.UserProperty: {
        throw new Error('get object from property service not implemented yet');
      }
      case FormValueSourceEnum.LastSaved: {
        return dot.get(storedModel ? storedModel : {}, dfv.target);
      }
      case FormValueSourceEnum.Value: {
        return dfv.value;
      }
      default:
        return dfv.value;
    }
  }

  calculate($event, field) {
    if (this.context.calculatedFields) {
      const filteredCalculatedFields = this.formConfigContext.calculatedFields.filter(
        value => {
          return Object.keys(value.fields).includes(field.key);
        }
      );
      const _calculatedModel = calculateFields(
        { ...this.formlyForm.model },
        filteredCalculatedFields
      );
      if (_calculatedModel !== this.model) {
        this.model = _calculatedModel;
      }
    }
  }

  /** Listen to model changes and check if there are any copy field configurations.
   */
  modelChange(model) {
    const _model = updateCopyFields(model, this.formConfigContext.copy || []);

    if (_model !== model) {
      this.model = _model;

      if (this.isFilterForm()) {
        this.submit(this.model);
      }
    }
  }

  submit(model) {
    if (this.form.valid) {
      this.form.disable({ emitEvent: false });
      this.submitForm(model, false);
    } else {
      console.log(`Form is not valid ${this.form.errors}`);
    }
    this.printService.changeSbPrintFormData(this.getPrettyPrintedFormValues());
  }

  onUpdateInitialValue() {
    if (this.formlyForm.options) {
      this.formlyForm.options.updateInitialValue();
      // this.options.updateInitialValue();
    }
  }

  defaultButtonLabel(): string {
    return this.isFilterForm() ? 'Search' : 'Submit';
  }

  onReset() {
    if (this.formlyForm.options) {
      this.formlyForm.options.resetModel();
    }
  }

  private submitForm(model, isConfirmed: boolean) {
    const body = this.getSubmitModel(model);

    if (this.isFilterForm()) {
      this.emitFormData(body);
      this.storeUsedValues();
      this.filterSaveDisabled = false;
    } else {
      if (!isConfirmed) {
        // this.showConfirmationDialog(model);
        this.openDialog(model);
      } else {
        this.storeUsedValues();
        this.entityId ? this.updateEntity(body) : this.createEntity(body);
      }
    }
  }

  private storeUsedValues() {
    if (
      this.context.defaultValues &&
      this.context.defaultValues.some(
        dfv => dfv.valueSource === FormValueSourceEnum.LastSaved
      )
    ) {
      this.storageService.localSet(this.context.formId, 'lastused', this.model);
    }
  }

  private showConfirmationDialog(model: any): void {
    console.log(this.getPrettyPrintedFormValues());
    this.confirmationService.confirm({
      header: 'Confirmation',
      icon: 'ui-icon-warning',
      message: `<span>Confirm Details?</span><br/>${this.getPrettyPrintedFormValues()}`,
      accept: () => this.submitForm(model, true),
      reject: () => this.form.enable({ emitEvent: false })
    });
  }

  private getPrettyPrintedFormValues() {
    // Filter out the ones without labels --> hidden fields with no labels should not be displayed in confirmation.
    const valuesWithLabels = this.getKeysAndLabels().filter(gkv => gkv.label);
    return this.getPrettyKeyValueHtml(valuesWithLabels);
  }

  private getPrettyKeyValueHtml(gkv: GroupKeyValueRow[]): string {
    return gkv.map(v => this.getPrettyGroupKeyValueRow(v)).join('');
  }

  private getPrettyGroupKeyValueRow(gkv: GroupKeyValueRow): string {
    this.printService.IsPrinting.subscribe(isprinting => {
      this.printLayout = isprinting;
    })

    if (!this.printLayout) {
      if (gkv.isGroupNode) {
        return gkv.includeGroupNodeLabel ? `<h3>${gkv.label}</h3>` : '';
      } else {
        // * is set directly in the configuration for labels to indicate mandatory fields. Should be moved to code?
        return `<div class='sb-confirmation-content'><div class='sb-confirmation-key'>${gkv.label.replace(
          '*',
          ''
        )}:</div> <div class='sb-confirmation-value'>${gkv.formattedValue ? gkv.formattedValue : ''
          }</div></div>`;
      }
    } else {
      return `<div class='print-layout sb-confirmation-content'>
                <div class='sb-confirmation-key'>
                  ${gkv.label.replace('*', '')}:
                </div> 
                <div class='sb-confirmation-value print-layout'>
                  ${gkv.formattedValue ? gkv.formattedValue : ''}
                </div>
              </div>`;
    }
  }

  private getKeysAndLabels() {
    const fields = this.fields;
    const res: GroupKeyValueRow[] = [];
    fields.forEach(f => {
      this.addKeyLabelRowFromField(f, res, null);
    });
    return res;
  }
  private addKeyLabelRowFromField(
    f: FormlyFieldConfig,
    res: GroupKeyValueRow[],
    parentKey: string
  ) {
    const label = f.templateOptions.label;
    const fieldGroup = f.fieldGroup;
    const isGroupNode = f.fieldGroup ? true : false;

    let key = null;
    // In a nested fieldGroup hierarchy the fieldKey may be empty --> pass the previous key in the hierarchy.
    if (f.key != null) {
      key = parentKey != null ? parentKey + '.' + f.key : f.key;
    } else {
      key = parentKey;
    }

    const includeGroupNodeLabel =
      f.templateOptions.label !== '' && f.templateOptions.label ? true : false;
    const value = isGroupNode ? null : dot.get(this.model, key);
    const componentItemText = getFormComponentItemtext(
      value,
      f.templateOptions.templateFields
    );
    const formattedValue = this.getFormattedFormComponentItemText(
      componentItemText,
      f
    );
    const valueLabelRow = {
      label,
      key,
      isGroupNode,
      includeGroupNodeLabel,
      formattedValue
    };
    res.push(valueLabelRow);
    if (fieldGroup) {
      fieldGroup.forEach(fc => this.addKeyLabelRowFromField(fc, res, key));
    }
  }
  getFormattedFormComponentItemText(
    formattedValue: any,
    f: FormlyFieldConfig
  ): string {
    if (formattedValue instanceof Array) {
      return formattedValue
        .map(fv => this.getFormattedFormComponentItemText(fv, f))
        .join('<br/>');
    } else if (formattedValue instanceof Date) {
      if (f.type && f.type === 'sb-timepicker') {
        return formattedValue.toLocaleTimeString();
      }
      return formattedValue.toLocaleDateString();
    } else if (f.templateOptions) {
      if (f.templateOptions.type === 'password') {
        return '********';
      }
      if (f.templateOptions.type === 'switch') {
        return formattedValue ? formattedValue : 'false';
      }
      if (
        f.templateOptions.type === 'select' &&
        f.templateOptions.options instanceof Array
      ) {
        const option = f.templateOptions.options.find(
          o => o.value === formattedValue
        );
        return option && option.label
          ? option.label
          : option
            ? option.value
            : formattedValue;
      }
      if (
        f.type &&
        f.type === 'radio' &&
        f.templateOptions.options instanceof Array
      ) {
        const option = f.templateOptions.options.find(
          o => o.value === formattedValue
        );
        return option.label ? option.label : option.value;
      }
    }
    return formattedValue;
  }

  isFilterForm(): boolean {
    return this.context.formType === FormType.Filter;
  }

  filterButtonClicked(event: any) {
    const filterName = event.target.textContent;
    const filter = this.savedFilters.find(f => f.name === filterName);
    if (filter) {
      this.activeFilterName = filterName;
      const _model = deepCopy(this.model);
      this.setFilterValues(_model, JSON.parse(filter.model, jsonParseDateSerializer));
      this.model = _model;
      setTimeout(() => {
        this.submit(this.model);
        this.filterSaveDisabled = true;
      }, 0);
      // Filter save gets enabled when searching.
      // In this case, disable it until user has changed values in form and done a new search.
    }
  }

  private setFilterValues(modelToUpdate: any, storedModel: any) {
    if (!this.formConfigContext.defaultValues || this.formConfigContext.defaultValues.length === 0) {
      Object.assign(modelToUpdate, storedModel);
    } else {
      const values = this.formConfigContext.defaultValues.filter(
        dfv => !dfv.excludeInSavedFilters
      );
      const targetValues = values.map(dfv => {
        return {
          value: dot.get(storedModel ? storedModel : {}, dfv.target),
          target: dfv.target
        };
      });
      targetValues.forEach(tv => {
        if (tv) {
          setObject(tv.target, tv.value, modelToUpdate);
        }
      });
    }
  }

  public updateFilter(isConfirmed: boolean, filterName: string) {
    if (!isConfirmed) {
      const dialogRef = this.dialog.open(SbConfirmDialogComponent, {
        width: '500px',
        hasBackdrop: true,
        disableClose: true,
        data: {
          title: "Confirm Filter Update",
          message: `This will overwrite the previous filter values with the current values in the filter form. Are you sure? <br/><br/><h2>Filter: ${filterName}</h2>`,
          cancelText: `No`,
          confirmText: `Yes`
        }
      });
      this.submitSubscription = dialogRef.componentInstance.submitConfirm
        .subscribe(data => {
          this.updateFilter(true, filterName);
        });
      dialogRef.afterClosed().subscribe(() => {
        this.submitSubscription.unsubscribe();
      });
    } else {
      const filterToUpdate = this.savedFilters.find(f => f.name === filterName);
      filterToUpdate.model = JSON.stringify(this.model);
      this.storageService.localSet(
        this.context.formId,
        'filters',
        this.savedFilters
      );
    }
  }

  public deleteFilter(isConfirmed: boolean, filterName: string) {
    if (!isConfirmed) {
      const dialogRef = this.dialog.open(SbConfirmDialogComponent, {
        width: '500px',
        hasBackdrop: true,
        disableClose: true,
        data: {
          title: "Delete Record Confirmation",
          message: `Are you sure you want to remove this search filter? This operation cannot be undone. <br/><br/><h2>Filter: ${filterName}</h2>`,
          cancelText: `No`,
          confirmText: `Yes`
        }
      });
      this.submitSubscription = dialogRef.componentInstance.submitConfirm
        .subscribe(data => {
          this.deleteFilter(true, filterName)
        });
      dialogRef.afterClosed().subscribe(() => {
        this.submitSubscription.unsubscribe();
      });
    } else {
      this.savedFilters = this.savedFilters.filter(f => f.name !== filterName);
      this.storageService.localSet(
        this.context.formId,
        'filters',
        this.savedFilters
      );
    }
  }

  private createFilter(event: any) {
    this.filterSaveButtonDisabled = true;
    this.filterSaveDisabled = true;
    const filterToSave = {
      name: this.enteredFilterName,
      model: JSON.stringify(this.model)
    };
    this.savedFilters.push(filterToSave);
    this.storageService.localSet(
      this.context.formId,
      'filters',
      this.savedFilters
    );
    this.activeFilterName = this.enteredFilterName;
    // Clear text field
    this.filterSaveTextbox.nativeElement.value = '';
    this.enteredFilterName = '';
  }

  private onFilterTextKeyUp(enteredText: string) {
    // todo - set delay here?
    this.enteredFilterName = enteredText;
    this.filterSaveButtonDisabled = this.enteredFilterName ? false : true;
  }

  private emitFormData(body: any): void {
    // Submit on event topic
    const payload: SbEvent = {
      source: this.context.formId,
      topic: SbEventTopic.FormFiltered,
      payload: body
    };
    this.eventBus.emit(payload);
    this.form.enable();
  }

  private getSubmitModel(model) {
    const transformedModel = transformModel(
      model,
      false,
      this.formConfigContext.formModelMapping
    );
    return transformedModel;
  }

  private createEntity(body: any): void {
    const method = this.formConfigContext.path.httpMethod;
    const url = this.dataService.getResourceUrl(
      this.formConfigContext.path,
      SbHost.GatewayBaseUrl
    );
    this.http
      .request(method, url, {
        body
      })
      .subscribe(
        response => this.handleSuccessfulSubmit(response),
        err => this.handleFailedSubmit(err)
      );
  }

  private updateEntity(body: any): void {
    const method = 'PUT';
    const url = this.dataService.getSingleResourceUrl(
      this.formConfigContext.path,
      SbHost.GatewayBaseUrl,
      this.entityId
    );
    this.http
      .request(method, url, {
        body
      })
      .subscribe(
        response => this.handleSuccessfulSubmit(response),
        err => this.handleFailedSubmit(err)
      );
  }

  private handleSuccessfulSubmit(responseData) {
    this.form.enable();
    if (this.formConfigContext.redirectPathOnSuccess) {
      this.router.navigate([this.formConfigContext.redirectPathOnSuccess]);
    } else {
      this.location.back();
    }
  }

  private handleFailedSubmit(data) {
    let detail = '';
    if (data.error.hasOwnProperty('errors')) {
      data.error.errors.forEach(error => {
        detail = detail.concat(this.propertiesService.getProperty(error.message));
      });
    } else if (data.hasOwnProperty('error')) {
      detail = data.error;
    }
    this.form.enable();
    this.msgs = [];
    this.msgs.push({
      severity: 'error',
      summary: 'Failed to submit form',
      detail: detail
    });
  }

  registerPrintListener() {
    this.subscription = this.eventBus.getObservable(SbEventTopic.Print).subscribe(
      event => {
        if (event) {
          if (event.payload === 'Printing') {
            this.isPrinting = true;
          } else {
            this.isPrinting = false;
          }
        }
      },
      error => console.log(error)
    );
  }
}

export class GroupKeyValueRow {
  label: string;
  key: string;
  isGroupNode: boolean;
  includeGroupNodeLabel: boolean;
  formattedValue: any;
}
