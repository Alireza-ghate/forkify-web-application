class SearchView {
  _parentElement = document.querySelector('.search');

  // public APIs
  getQuery() {
    const query = this._parentElement.querySelector('.search__field').value;
    document.querySelector('.search__field').blur();
    this._clearInput();
    return query;
  }

  addHandlerSearch(handler) {
    this._parentElement.addEventListener('submit', function (e) {
      e.preventDefault();
      handler();
    });
  }

  _clearInput() {
    this._parentElement.querySelector('.search__field').value = '';
  }
}

export default new SearchView();
