import icons from 'url:../../img/icons.svg';

// because we are not creating any object from this class we can export the entire class
export default class View {
  _data;

  render(data, render = true) {
    // if there is no data(null or undefined) OR data is an array AND the data array is an empty array then exit the function and call the renderError
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();
    this._data = data;
    const markup = this._generateMurkup();
    if (!render) return markup;
    // clear the recipe container
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // DOM algorithm only for text and attribute changes
  update(data) {
    this._data = data;
    const newMarkup = this._generateMurkup();
    // creats a vitual DOM(DOM That not in the page but its on memory)
    const newDOM = document.createRange().createContextualFragment(newMarkup);
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));
    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      // updates change node

      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trimEnd() !== ''
      ) {
        curEl.textContent = newEl.textContent;
      }

      // update change attributes
      if (!newEl.isEqualNode(curEl)) {
        // Array.from(newEl.attributes) ==> [attr1 , attr2 , ...]
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
      }
    });
  }

  _clear() {
    this._parentElement.innerHTML = '';
  }

  renderError(message = this._errorMessage) {
    const markup = `
            <div class="error">
                <div>
                  <svg>
                    <use href="${icons}#icon-alert-triangle"></use>
                </svg>
                </div>
                    <p>${message}</p>
            </div>`;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderMessage(message = this._message) {
    const markup = `
    <div class="message">
          <div>
            <svg>
              <use href="${icons}#icon-smile"></use>
            </svg>
          </div>
          <p>${message}</p>
        </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderSpinner() {
    const markup = `
    <div class="spinner">
        <svg>
            <use href="${icons}#icon-loader"></use>
        </svg>
      </div>
    `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
