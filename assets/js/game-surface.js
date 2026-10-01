// Game surfaces consume browser gestures; editable controls remain native.
document.addEventListener('contextmenu',event=>{if(!event.target.closest('input,textarea,[contenteditable="true"]'))event.preventDefault();});
document.addEventListener('dragstart',event=>{if(!event.target.closest('input,textarea,[contenteditable="true"]'))event.preventDefault();});
