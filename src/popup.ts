import { getStorageItem } from './helpers';
import {
  ButtonText,
  ButtonType,
  InputEvent,
  FormField,
  GRADES_SUMMARY_URL,
  INVALID_URL_HTML,
} from './types';
import '../public/popup.css';

let titleInput: HTMLInputElement;
let checkboxInputs: NodeListOf<HTMLInputElement>;
let button: HTMLButtonElement;
let formInput: HTMLInputElement;
let errorMessage: HTMLElement;

addEventListener('DOMContentLoaded', async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0].url != GRADES_SUMMARY_URL) {
      document.querySelector('.container').innerHTML = INVALID_URL_HTML;
      return;
    }
  });
  titleInput = document.querySelector('#titleInput');
  checkboxInputs = document.querySelectorAll('.checkboxInput');
  button = document.querySelector('#button');
  formInput = document.querySelector('#formInput');
  errorMessage = document.querySelector('#errorMessage');

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

const handleButtonClick = () => {
  errorMessage.textContent = '';
  if (button.type === ButtonType.SUBMIT) return;

  const options: any = {};
  options.title = titleInput.value;
  checkboxInputs.forEach((el) => (options[el.id] = el.checked));

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const request = { action: 'GENERATE_TRANSCRIPT', options };
    button.textContent = 'Generating...';
    chrome.tabs.sendMessage(tabs[0].id, request, async (response) => {
      if (chrome.runtime.lastError) {
        errorMessage.textContent = 'Error: Could not generate transcript.';
        resetButton();
      } else {
        formInput.value = 'data:application/zip;base64,' + response.data;
        button.type = ButtonType.SUBMIT;
        button.textContent = ButtonText.SUBMIT;
      }
    });
  });
};

const handleUpdateOptions = async (event: InputEvent) => {
  if (event.type == 'input') {
    await chrome.storage.sync.set({ [FormField.Title]: event.target.value });
  } else {
    await chrome.storage.sync.set({ [event.target.id]: event.target.checked });
  }
  if (button.type === ButtonType.SUBMIT) {
    resetButton();
  }
};

const resetButton = () => {
  button.type = ButtonType.DEFAULT;
  button.textContent = ButtonText.DEFAULT;
  formInput.value = '';
};
