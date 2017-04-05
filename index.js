// POLYFILL FOR APPEND
// Source: https://github.com/jserz/js_piece/blob/master/DOM/ParentNode/append()/append().md
(function (arr) {
  arr.forEach(function (item) {
    if (item.hasOwnProperty('append')) {
      return;
    }
    Object.defineProperty(item, 'append', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function append() {
        var argArr = Array.prototype.slice.call(arguments),
          docFrag = document.createDocumentFragment();
        
        argArr.forEach(function (argItem) {
          var isNode = argItem instanceof Node;
          docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
        });
        
        this.appendChild(docFrag);
      }
    });
  });
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);

// STEVE DASH BOARD

const POLLEN_URI = 'https://desolate-earth-10123.herokuapp.com/pollen';

const createTextElement = (text, className) => {
  const element = document.createElement('div');
  element.className = className;
  element.append(document.createTextNode(text));
  return element;
};

document.addEventListener("DOMContentLoaded", function(event) {
  const updatePollenWidget = (pollenData) => {
    const widget = document.getElementById('pollenWidget'); 
    pollenData.Location.periods.forEach((period) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'pollenWidget__wrapper';

      wrapper.append(createTextElement(period.Type, 'pollenWidget__type'));
      wrapper.append(createTextElement(`Index: ${period.Index}`, 'pollenWidget__index'));

      const triggers = document.createElement('div');
      triggers.className = 'pollenWidget__triggers';
      triggers.append(createTextElement('Top Allergens: ', 'pollenWidget__triggersHeader'));

      period.Triggers.forEach((trigger) => {
        const panel = document.createElement('div');
        panel.className = 'pollenWidget__trigger';

        panel.append(createTextElement(`${trigger.Name} (${trigger.PlantType})`, 'pollenWidget__name'));

        triggers.append(panel);
      });
      wrapper.append(triggers);

      widget.append(wrapper);
    });
  };

  const getPollenData = () => {
    const httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          updatePollenWidget(JSON.parse(httpRequest.responseText));
        }
      }
    };
    httpRequest.open('GET', POLLEN_URI);

    httpRequest.send();
  };

  getPollenData();
});

