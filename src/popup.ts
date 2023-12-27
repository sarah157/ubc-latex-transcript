import { getStorageItem } from './helpers';
import { ButtonText, ButtonType, InputEvent, FormField } from './model';
import '../public/popup.css';

let titleInput: HTMLInputElement;
let checkboxInputs: NodeListOf<HTMLInputElement>;
let button: HTMLButtonElement;
let formInput: HTMLInputElement;

addEventListener('DOMContentLoaded', async () => {
  titleInput = document.querySelector('#titleInput');
  checkboxInputs = document.querySelectorAll('.checkboxInput');
  button = document.querySelector('#button');
  formInput = document.querySelector('#formInput');

  titleInput.addEventListener('input', handleUpdateOptions);
  titleInput.value = await getStorageItem(FormField.Title);

  checkboxInputs.forEach(async (el) => {
    el.addEventListener('click', handleUpdateOptions);
    el.checked = await getStorageItem(el.id);
  });

  button.addEventListener('click', handleButtonClick);
  button.type = ButtonType.DEFAULT;
  button.textContent = ButtonText.DEFAULT;
});

const handleUpdateOptions = async (event: InputEvent) => {
  if (event.type == 'input') {
    await chrome.storage.sync.set({ [FormField.Title]: event.target.value });
  } else {
    await chrome.storage.sync.set({ [event.target.id]: event.target.checked });
  }
  if (button.type === ButtonType.SUBMIT) {
    // reset to default
    button.type = ButtonType.DEFAULT;
    button.textContent = ButtonText.DEFAULT;
    formInput.value = '';
  }
};

const handleButtonClick = () => {
  if (button.type === ButtonType.SUBMIT) return;

  const options: any = {};
  options.title = titleInput.value;
  checkboxInputs.forEach((el) => (options[el.id] = el.checked));

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const request = { action: 'GENERATE_TRANSCRIPT', options };
    button.textContent = 'Generating...';
    chrome.tabs.sendMessage(tabs[0].id, request, async (response) => {
      button.type = ButtonType.SUBMIT;
      button.textContent = ButtonText.SUBMIT;
      formInput.value = 'data:application/zip;base64,' + response.data;
    });
  });
};
