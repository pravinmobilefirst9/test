import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[appSbPanel]'
})
export class SbWidgetDirective {
    constructor(public viewContainerRef: ViewContainerRef) {}
}
