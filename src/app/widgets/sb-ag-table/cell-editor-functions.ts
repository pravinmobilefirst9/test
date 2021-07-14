
export default function getNumericCellEditor() {

    function isCharNumeric(charStr) {
      return !!/\d/.test(charStr);
    }

    function isKeyPressedNumeric(event): boolean {
      const charCode = getCharCodeFromEvent(event);
      const previousText = event.srcElement.value || '';
      const charAllowed = ['.', 'Backspace'];
      const negativeAllowed = previousText === '';
      if (negativeAllowed) { charAllowed.push('-'); }
      const charAllowedFiltered =  charAllowed.filter(ch => !previousText.includes(ch));
      const charStr = event.key ? event.key : String.fromCharCode(charCode);
      return isCharNumeric(charStr) || charAllowedFiltered.includes(charStr);
    }

    function getCharCodeFromEvent(event) {
      event = event || window.event;
      return typeof event.which === 'undefined' ? event.keyCode : event.which;
    }

    // function to act as a class
    function NumericCellEditor() {}

    // gets called once before the renderer is used
    NumericCellEditor.prototype.init = function (params) {
      // we only want to highlight this cell if it started the edit, it is possible
      // another cell in this row started the edit
      this.focusAfterAttached = params.cellStartedEdit;

      // create the cell
      this.eInput = document.createElement('input');
      this.eInput.style.width = '100%';
      this.eInput.style.height = '100%';
      this.eInput.value = isCharNumeric(params.charPress)
        ? params.charPress
        : params.value;

      let that = this;
      this.eInput.addEventListener('keypress', function (event) {
        if (!isKeyPressedNumeric(event)) {
          that.eInput.focus();
          if (event.preventDefault) { event.preventDefault(); }
        }
      });
    };

    // gets called once when grid ready to insert the element
    NumericCellEditor.prototype.getGui = function () {
      return this.eInput;
    };

    // focus and select can be done after the gui is attached
    NumericCellEditor.prototype.afterGuiAttached = function () {
      // only focus after attached if this cell started the edit
      if (this.focusAfterAttached) {
        this.eInput.focus();
        this.eInput.select();
      }
    };

    // returns the new value after editing
    NumericCellEditor.prototype.isCancelBeforeStart = function () {
      return this.cancelBeforeStart;
    };

    // example - will reject the number if it contains the value 007
    // - not very practical, but demonstrates the method.
    NumericCellEditor.prototype.isCancelAfterEnd = function () {};

    // returns the new value after editing
    NumericCellEditor.prototype.getValue = function () {
      return this.eInput.value;
    };

    // when we tab onto this editor, we want to focus the contents
    NumericCellEditor.prototype.focusIn = function () {
      let eInput = this.getGui();
      eInput.focus();
      eInput.select();
      console.log('NumericCellEditor.focusIn()');
    };

    // when we tab out of the editor, this gets called
    NumericCellEditor.prototype.focusOut = function () {
      // but we don't care, we just want to print it for demo purposes
      console.log('NumericCellEditor.focusOut()');
    };

    return NumericCellEditor;
  }
