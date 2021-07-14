import {
  FieldMapping,
  CalculatedField,
  FieldCopy
} from './sb-form-configuration/sb-form-context';
import * as dot from 'dot-prop';
import * as math from 'mathjs';
import uuidv4 from 'uuid/v4';

function setObject(name, value, context) {
  const parts = name.split('.');
  const key = parts.pop();
  for (let i = 0, j; context && (j = parts[i]); i++) {
    context = j in context ? context[j] : (context[j] = {});
  }
  return context && key ? (context[key] = value) : undefined;
}

function getObjectByKeyValue(key, value, theObject) {
  let result = null;
  if (theObject instanceof Array) {
    for (let i = 0; i < theObject.length; i++) {
      result = getObjectByKeyValue(key, value, theObject[i]);
      if (result) {
        break;
      }
    }
  } else {
    for (const prop of Object.keys(theObject)) {
      if (prop === key && theObject[prop] === value) {
        return theObject;
      }
      if (
        theObject[prop] instanceof Object ||
        theObject[prop] instanceof Array
      ) {
        result = getObjectByKeyValue(key, value, theObject[prop]);
        if (result) {
          break;
        }
      }
    }
  }
  return result;
}

function getObjectDotPath(path, theObject) {
  const result = path.split('.').reduce((acc, value) => {
    if (acc != null) {
      return getObjectByKeyValue('key', value, acc);
    } else {
      return null;
    }
  }, theObject);
  return result;
}

function getObject(key, theObject) {
  let result = null;
  if (theObject instanceof Array) {
    for (let i = 0; i < theObject.length; i++) {
      result = getObject(key, theObject[i]);
      if (result) {
        break;
      }
    }
  } else {
    for (const prop of Object.keys(theObject)) {
      if (prop === key) {
        return theObject[key];
      }
      if (
        theObject[prop] instanceof Object ||
        theObject[prop] instanceof Array
      ) {
        result = getObject(key, theObject[prop]);
        if (result) {
          break;
        }
      }
    }
  }
  return result;
}

function deepCopy(obj) {
  let copy;

  // Handle the 3 simple types, and null or undefined
  if (null == obj || 'object' !== typeof obj) { return obj; }

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (let i = 0, len = obj.length; i < len; i++) {
      copy[i] = deepCopy(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (const attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        copy[attr] = deepCopy(obj[attr]);
      }
    }
    return copy;
  }

  throw new Error('Unable to copy obj! Its type is not supported.');
}

/**
 * Expects an optional source model (typically read from db)
 *
 */
function transform(
  fieldMappingTuples: any[],
  from: boolean = true,
  sourceModel?: any
) {
  fieldMappingTuples.reduce((acc, tuple) => {
    const [sourcePath, targetPath] = from ? tuple : tuple.reverse();
    const sourceValue = dot.get(sourceModel, sourcePath);
    return dot.set(acc, targetPath, sourceValue);
  }, {});
}

function transformModel(
  model,
  reverse: boolean = false,
  fieldMappings?: FieldMapping[]
) {
  if (fieldMappings) {
    const transformedResult = {};
    const constantValues = fieldMappings.filter(fm =>
      fm.source.startsWith('#')
    );
    const standardFieldMappings = fieldMappings.filter(
      fm => !fm.source.startsWith('#')
    );
    constantValues.forEach(fm => {
      const sourceValue = fm.source.substring(1);
      setObject(fm.target, sourceValue, transformedResult);
    });

    standardFieldMappings.forEach(fm => {
      const [sourcePath, targetPath] = !reverse
        ? [fm.source, fm.target]
        : [fm.target, fm.source];
      const sourceValue = sourcePath.split('.').reduce((o, i) => {
        return o ? o[i] : null;
      }, model);
      if (sourceValue && fm.valueLabel && !reverse) {
        if (sourceValue.hasOwnProperty('value')) {
          setObject(targetPath, sourceValue.value, transformedResult);
        } else {
          setObject(targetPath, sourceValue, transformedResult);
        }
      } else {
        setObject(targetPath, sourceValue, transformedResult);
      }
    });
    return transformedResult;
  } else {
    return model;
  }
}

/**
 * The copy field configuration will take a source field value and copy it to a
 * target field value if it is blank.
 * e.g, Selection of a depository account will automatically set the payment account.
 */
function updateCopyFields(model, copyConfig: FieldCopy[]) {
  const _model = copyConfig.reduce((acc, config) => {
    const source = dot.get(acc, config.source);
    const target = dot.get(acc, config.target) as string;
    if (source && (!target || config.overwriteIfSet)) {
      dot.set(acc, config.target, source);
      return { ...acc };
    }
    return acc;
  }, model);
  return _model;
}

function calculateFields(model, calculatedFields: CalculatedField[]) {
  const _model = calculatedFields.reduce((acc, config) => {
    let scope = {};
    Object.keys(config.fields).forEach(key => {
      const path = config.fields[key];
      let value = dot.get(model, path) || 0;
      if (typeof value === 'string') {
        value = value.replace(/\s/g, '');
      }
      scope = { ...scope, [key]: value };
    });
    try {
      const result = math.eval(config.mathExpression, scope);
      dot.set(acc, config.target, result);
      return { ...acc };
    } catch (error) {
      console.error(error);
    }
  }, model);
  return _model;
}

function getFormComponentItemtext(item, templateFields: string[]) {
  if (!item) {
    return '';
  }
  if (item.hasOwnProperty('value') && item.hasOwnProperty('label')) {
    // Standard dropdown or multiselect
    return item.label;
  }
  if (templateFields) {
    // Dropdown or multiselect with predefined template fields.
    return templateFields.map(f => item[f]).join(' ');
  }
  return item;
}

function getMultiSelectDisplayText(options, formControl) {
  let displayText = '';
  let selectedOptions = [];
  if (formControl && formControl.value) {
    selectedOptions = formControl.value;
  } else {
    selectedOptions = formControl;
  }
  if (selectedOptions) {
    if (selectedOptions.length > 1 && options) {
      displayText = selectedOptions.length + ' out of ' + options.length + ' selected';
    } else {
      if (options) {
        options.forEach(option => {
          if (option.value === selectedOptions[0]) {
            displayText = option.label;
          }
        });
      }
    }
  }
  return displayText;
}

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export {
  getObject,
  getObjectByKeyValue,
  setObject,
  transformModel,
  transform,
  updateCopyFields,
  calculateFields,
  getObjectDotPath,
  getFormComponentItemtext,
  getMultiSelectDisplayText,
  deepCopy,
  uuidv4
};
