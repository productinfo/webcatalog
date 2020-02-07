import isUrl from './is-url';
import isValidLicenseKey from './is-valid-license-key';

const kits = {
  required: (val, _, fieldName) => {
    if (!val || val === '') {
      return '{fieldName} is required.'.replace('{fieldName}', fieldName);
    }

    return null;
  },
  url: (val, _, fieldName) => {
    if (!isUrl(val)) {
      return '{fieldName} is not valid.'.replace('{fieldName}', fieldName);
    }
    return null;
  },
  // accept link without protocol prefix
  lessStrictUrl: (val, _, fieldName) => {
    if (!isUrl(val) && !isUrl(`http://${val}`)) {
      return '{fieldName} is not valid.'.replace('{fieldName}', fieldName);
    }
    return null;
  },
  licenseKey: (val, _, fieldName) => {
    if (!isValidLicenseKey(val)) {
      return '{fieldName} is not valid.'.replace('{fieldName}', fieldName);
    }
    return null;
  },
  filePath: (val, _, fieldName) => {
    // https://stackoverflow.com/questions/1976007/what-characters-are-forbidden-in-windows-and-linux-directory-names
    // win32
    if (window.process.platform === 'win32') {
      if (val.match(/[\\/:*?"<>|\000-\031]/)) {
        return '{fieldName} cannot contain any of the following characters: \\ / : * ? " < > | or non-printable characters.'
          .replace('{fieldName}', fieldName);
      }
    } else if (val.match(/[/:\000]/)) {
      // unix
      return '{fieldName} cannot contain any of the following characters: / : or NUL.'
        .replace('{fieldName}', fieldName);
    }
    return null;
  },
};

const validate = (changes, rules) => {
  const newChanges = { ...changes };

  Object.keys(changes).forEach((key) => {
    let err = null;

    const val = newChanges[key];

    if (rules[key]) {
      const { fieldName } = rules[key];

      Object.keys(rules[key]).find((ruleName) => {
        if (ruleName === 'fieldName') return false;

        const ruleVal = rules[key][ruleName];

        err = kits[ruleName](val, ruleVal, fieldName);

        return err !== null;
      });
    }

    newChanges[`${key}Error`] = err;
  });

  return newChanges;
};

export default validate;
