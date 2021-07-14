import { DatePipe, DecimalPipe, PercentPipe } from "@angular/common";
import { SbPropertiesService } from "../../../services/sb-properties.service";

export class FormattingFunctions {
  public columnTypes = {
    key: {
      valueFormatter: data => {
        if (data && data.value) {
          return this.propertiesService.getProperty(data.value);
        }
      }
    },
    shortDate: {
      valueFormatter: data =>
        this.dateFormatter.transform(data.value, "yyyy-MM-dd")
    },
    amount: {
      valueFormatter: data => {
        if (data && data.value) {
          const formattedNumber = this.numberFormatter.transform(
            data.value,
            `1.${data.decimals === undefined ? 0 : data.decimals}-${data.decimals === undefined ? 0 : data.decimals
            }`,
            "se"
          );
          return data.value > 0 ? formattedNumber : formattedNumber;
        }
      }
    },
    color: {
      cellClassRules: {
        "cell-negative": "x < 0",
        "cell-positive": "x > 0",
        "cell-neutral": "x == 0"
      }
    },
    bold: {
      // Workaround to be able to set bold on specific items in advanced key figure panel.
      cellClassRules: {
        "cell-bold": "true"
      }
    },
    price: {
      valueFormatter: data => {
        if (data && data.value) {
          const formattedNumber = this.numberFormatter.transform(
            data.value,
            `1.${data.decimals === undefined ? 2 : data.decimals}-${data.decimals === undefined ? 2 : data.decimals
            }`,
            "se"
          );
          return data.value > 0 ? formattedNumber : formattedNumber;
        }
      }
    },
    money: {
      valueFormatter: data => {
        try {
          if (data && data.value) {
            if (typeof data.value === "string") {
              // Match any numbers
              const regExpDigits = /^-?\d*\.{0,1}\d/;
              const digits = data.value.match(regExpDigits)[0];
              // Match any alfa
              const regExpAlpha = /[a-zA-Z]+/;
              const optionalCurrency = data.value.match(regExpAlpha);
              const suffix = optionalCurrency ? " " + optionalCurrency[0] : "";
              const formattedNumber = this.numberFormatter.transform(
                digits,
                `1.${data.decimals === undefined ? 0 : data.decimals}-${data.decimals === undefined ? 0 : data.decimals
                }`,
                "se"
              );
              return formattedNumber + suffix;
            } else {
              const formattedNumber = this.numberFormatter.transform(
                data.value,
                `1.${data.decimals === undefined ? 0 : data.decimals}-${data.decimals === undefined ? 0 : data.decimals
                }`,
                "se"
              );
              return formattedNumber;
            }
          }
        } catch (e) {
          console.log(e);
          return data.value;
        }
      }
    },
    quantity: {
      valueFormatter: data => {
        if (data && data.value) {
          const formattedNumber = this.numberFormatter.transform(
            data.value,
            `1.${data.decimals === undefined ? 0 : data.decimals}-${data.decimals === undefined ? 0 : data.decimals
            }`,
            "se"
          );
          return data.value > 0 ? formattedNumber : formattedNumber;
        }
      }
    },
    percentage: {
      valueFormatter: data => {
        if (data && data.value) {
          const formattedNumber = this.percentFormatter.transform(
            data.value,
            `1.${data.decimals || 2}-${data.decimals || 2}`,
            "se"
          );
          return data.value > 0 ? formattedNumber : formattedNumber;
        }
      }
    },
    red_green: {
      cellClassRules: {
        "cell-negative": 'x == "arrow_downward"',
        "cell-positive": 'x == "arrow_upward"'
      }
    },
    checkbox: {
      cellRenderer: params => {
        if (typeof params.value === "boolean") {
          const checked = params.value === true ? "checked" : "";
          const uid = this.uuidv4();
          return `
           <div class="checkboxTwo">
              <input type="checkbox" disabled="disabled" value="1" id="checkbox-${uid}" name="" ${checked}/>
              <label for="checkbox-${uid}"></label>
            </div>
           `;
        }
      }
    },
    roundBullet: {
      cellRenderer: params => {
        if (typeof params.value === "string" && params.value) {
          return `
            <i class="material-icons ${params.value}">lens</i>
          `;
        }
      }
    },
    flagIcon: {
      cellRenderer: countryCode => {
        if (countryCode && countryCode.value) {
          return `
          <span class="flag-icon flag-icon-${countryCode.value}"></span>
          `;
        }
      }
    },
    materialIcon: {
      cellRenderer: icon => {
        if (typeof icon.value === "string" && icon.value) {
          return `
            <i class="material-icons">${icon.value}</i>
          `;
        }
      }
    }
  };

  /** Takes an object with cell class rules and returns an array of css classes*/
  getCellClasses(cellClassRules: any, value: any): string[] {
    const cssClasses = [];
    for (const rule in cellClassRules) {
      if (cellClassRules.hasOwnProperty(rule)) {
        const x = value;
        // @ts-ignore: Ignore evaluation
        if (eval(cellClassRules[rule])) {
          cssClasses.push(rule);
        }
      }
    }
    return cssClasses;
  }

  getFormattedTextFromCellTypes(
    columnConfig: { decimals?: number },
    types: any,
    initialValue: any
  ): string {
    // We can't apply several text formatters to one cell --> take first hit
    const formatterTypes = types.filter(
      t =>
        this.columnTypes[t] &&
        typeof this.columnTypes[t].valueFormatter === "function"
    );
    const formattedText = formatterTypes.map(c => {
      const decimals =
        columnConfig.decimals === undefined ? 4 : columnConfig.decimals;
      return this.columnTypes[c].valueFormatter({
        value: initialValue,
        decimals
      });
    });
    return formatterTypes.length > 0 ? formattedText[0] : initialValue;
  }

  getCellClassRulesFromCellTypes(
    columnTypeKeys: any,
    initialValue: any
  ): string[] {
    return columnTypeKeys
      .filter(t => this.columnTypes[t] && this.columnTypes[t].cellClassRules)
      .flatMap(c => {
        return this.getCellClasses(
          this.columnTypes[c].cellClassRules,
          initialValue
        );
      });
  }

  uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  constructor(
    private dateFormatter: DatePipe,
    private numberFormatter: DecimalPipe,
    private percentFormatter: PercentPipe,
    private propertiesService: SbPropertiesService
  ) { }
}
