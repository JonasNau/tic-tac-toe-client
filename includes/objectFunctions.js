export function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export function isJSON(data) {
  try {
    JSON.stringify(data);
    JSON.parse(data);
  } catch (e) {
    return false;
  }
  return true;
}

export function validJSON(json) {
  if (IsJsonString) {
    return true;
  }
  if (isJSON) {
    return true;
  }
  return false;
}

export function makeJSON(string) {
  try {
    if (!validJSON) {
      return false;
    } else {
      let json = string;

      while (typeof json == "string" && validJSON(json)) {
        json = JSON.parse(json);
      }
      return json;
    }
  } catch (e) {
    return false;
  }
}

export function arrayIncludesValue(array, value) {
  if (typeof array != typeof new Array()) return false;
  if (array.includes(value)) {
    return true;
  }
  return false;
}

export function removeFromArray(array, value) {
  return array.filter(function (ele) {
    return ele != value;
  });
}

export function addToArray(
  array = new Array(),
  value,
  includeMultiple = false
) {
  if (!array || emptyVariable(value)) return array;

  if (includeMultiple) {
    array.push(value);
  } else {
    if (!arrayIncludesValue(array, value)) {
      array.push(value);
      console.log(array);
    }
  }
  return array;
}


export function isEmptyInput(input, strictmode = false) {
  if (strictmode) {
    if (input === "" || input === false || input.trim().length == 0) {
      return true;
    }
  } else {
    if (input === "" || input == false || input.trim().length == 0) {
      return true;
    }
  }

  return false;
}