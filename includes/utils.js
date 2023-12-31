import Swal from "sweetalert2";

export async function errorMessage(message, yes_no = false) {
  return new Promise(async (resolve, reject) => {
    if (yes_no) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
        showCloseButton: true,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Yes",
      }).then((result) => {
        if (result.isConfirmed) {
          resolve(true);
        }
        resolve(false);
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: "OK",
      }).then(resolve(true));
    }
  });
}

export async function showMessage(message, title = "Message", yes_no = false) {
  return new Promise(async (resolve, reject) => {
    if (yes_no) {
      await Swal.fire({
        title: "Message",
        text: message,
        showCloseButton: true,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Yes",
      }).then((result) => {
        if (result.isConfirmed) {
          resolve(true);
        }
        resolve(false);
      });
    } else {
      Swal.fire({
        title: "Message",
        text: message,
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: "OK",
      }).then(resolve(true));
    }
  });
}

export function removeAllEventlisteners(element) {
  if (!element) {
    return element;
  }
  // Make a copy
  var copy = element.cloneNode(true);
  //Replace
  element.replaceWith(copy);
  return copy;
}
