const form = document.querySelector('[data-search-form]');
const input = document.querySelector('#bridge-search');
const cards = [...document.querySelectorAll('[data-bridge]')];
const count = document.querySelector('#result-count');
const empty = document.querySelector('#no-results');
const clear = document.querySelector('#clear-search');

if (form && input && count && empty && clear) {
  form.hidden = false;
  form.addEventListener('submit', (event) => event.preventDefault());
  const update = () => {
    const query = input.value.trim().toLocaleLowerCase('en-US');
    let visible = 0;
    for (const card of cards) {
      card.hidden = !card.dataset.search.toLocaleLowerCase('en-US').includes(query);
      if (!card.hidden) visible += 1;
    }
    count.textContent = query ? `${visible} of ${cards.length} bridges` : `${cards.length} bridges to explore`;
    empty.hidden = visible !== 0;
    clear.hidden = query.length === 0;
  };
  input.addEventListener('input', update);
  clear.addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
}
