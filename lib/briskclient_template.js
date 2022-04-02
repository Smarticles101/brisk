let tagdata = JSON.parse(`<%- tagdata %>`);

// tagdata is an array of tags joined with their triggers

window.onload = function () {
  for (let i = 0; i < tagdata.length; i++) {
    let tag = tagdata[i];
    if (tag.trigger.type !== 1) {
      continue;
    }

    var tag_html = tag.code.trim();
    // HTML5 specifies that a <script> tag inserted with innerHTML should not execute.
    // https://www.w3.org/TR/2008/WD-html5-20080610/dom.html#innerhtml0
    
    var template = document.createElement('template');
    template.innerHTML = tag_html;

    var children = template.content.childNodes;

    for (let j = 0; j < children.length; j++) {
      let child = children[j];
      if (child.nodeType === 1) {
        if (child.tagName === 'SCRIPT') {
          // script tag
          let script = document.createElement('script');
          script.innerHTML = child.innerHTML;
          script.async = child.async;
          script.src = child.src;
          document.body.appendChild(script);
        } else {
          // other tag
          document.body.appendChild(child);
        }
      }
    }
  }
};
