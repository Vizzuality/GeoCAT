
var ListModel = function (items) {
    this._items = items;
    this._selectedIndex = -1;
 
    this.itemAdded = new Event(this);
    this.itemRemoved = new Event(this);
    this.selectedIndexChanged = new Event(this);
};


ListModel.prototype = {
 
    getItems : function () {
        return [].concat(this._items);
    },
 
    addItem : function (item) {
        this._items.push(item);
        this.itemAdded.notify({item: item});
    },
 
    removeItemAt : function (index) {
        var item = this._items[index];
        this._items.splice(index, 1);
        this.itemRemoved.notify({item: item});
        if (index == this._selectedIndex)
            this.setSelectedIndex(-1);
    },
 
    getSelectedIndex : function () {
        return this._selectedIndex;
    },
 
    setSelectedIndex : function (index) {
        var previousIndex = this._selectedIndex;
        this._selectedIndex = index;
        this.selectedIndexChanged.notify({previous: previousIndex});
    }
 
}; 


var Event = function (sender) {
    this._sender = sender;
    this._listeners = [];
};
 

Event.prototype = {
    attach : function (listener) {
        this._listeners.push(listener);
    },
    notify : function (args) {
        for (var i = 0; i < this._listeners.length; i++) {
            this._listeners[i](this._sender, args);
        }
    }
};


