/**
 * GCMD keywords.
 */

Ext.define('DMPlanner.ux.Keywords', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.dmpkeywords',
    requires: ['Ext.ux.grid.FilterBar', //
    'Ext.grid.plugin.DragDrop', //
    'Ext.grid.column.Template', //
    'Ext.tree.plugin.TreeViewDragDrop', //
    'Ext.data.Model', //
    'Ext.data.Store', //
    'Ext.data.TreeStore', //
    'Ext.data.proxy.Rest', //
    'Ext.data.proxy.JsonP', //
    'Ext.layout.container.Border', //
    'Ext.tab.Panel', //
    'Ext.tree.Panel', //
    'Ext.LoadMask', //
    'Ext.data.writer.Json'//
    ],

    layout: {
        type: 'border'
    },
    title: 'Keywords',

    dmpSerialize: function(records) {
        var obj = [];

        Ext.each(records, function(record) {
            var s = Ext.data.writer.Json.prototype.getRecordData(record);
            //don't want to save these
            delete s.leaf;
            delete s.parentId;

            obj.push(s);
        });

        return obj;
    },

    initComponent: function() {
        var me = this, keywordtree, keywords, keywordStore, addTpl = '<tpl if="text && depth !== 1"><div data-qtip="Add: {[Ext.htmlEncode(values.text)]}" class="fa dmp-col-move">&#xf138;</div></tpl>', removeTpl = '<tpl if="text"><div data-qtip="Remove: {[Ext.htmlEncode(values.text)]}" class="fa dmp-col-move">&#xf137;</div></tpl>', helpCol = {
            xtype: 'templatecolumn',
            width: 28,
            text: '',
            hideable: false,
            style: {
                cursor: 'help'
            },
            tpl: '<tpl if="definition"><div data-qtip="{[Ext.htmlEncode(values.definition)]}" class="fa dmp-col-info">&#xf05a;</div></tpl>'
        }, testDuplicate = function(node, data, overModel, dropPosition, dropHandlers) {
            var store = this.down('#planKeywords').getStore(), draggedRecords = data.records, ln = draggedRecords.length, i, record;

            for ( i = 0; i < ln; i++) {
                record = draggedRecords[i];
                //reject duplicates
                if (store.findExact('keywordid', record.getId()) !== -1) {
                    return false;
                }

                return true;
            }
        }, addKeyword = function(view, el, idx, col) {
            var store = this.down('#planKeywords').getStore(), sel = view.getSelectionModel().getSelection(), data = {
                records: sel
            };

            if (testDuplicate.call(this, null, data)) {
                store.add(sel);
            }
        }, addCol = {
            xtype: 'templatecolumn',
            width: 28,
            text: '',
            hideable: false,
            tpl: addTpl,
            action: 'addkeyword',
            listeners: {
                click: {
                    fn: addKeyword,
                    scope: this
                }
            }
        }, rmKeyword = function(view, el, idx, col) {
            var sel = view.getSelectionModel().getSelection();
            view.getStore().remove(sel);
        };

        if (!Ext.ModelManager.getModel('KeywordNode')) {
            Ext.define('KeywordNode', {
                extend: 'Ext.data.Model',
                fields: [{
                    name: 'keywordid',
                    type: 'string'
                }, {
                    name: 'text',
                    type: 'string',
                    useNull: true
                }, {
                    name: 'definition',
                    type: 'string',
                    useNull: true
                }, {
                    name: 'fullname',
                    type: 'string',
                    useNull: true
                }],
                idProperty: 'keywordid',

                proxy: {
                    type: 'jsonp',
                    url: 'http://gcmd.herokuapp.com/keyword/tree',
                    reader: {
                        type: 'json'
                    },
                    appendId: true
                }
            });
        }

        //if (!Ext.getStore('PlanKeywords')) {
        keywordStore = Ext.create('Ext.data.Store', {
            model: 'KeywordNode',
            //storeId: 'PlanKeywords',
            //autoLoad: false,
            autoDestroy: true,
            data: me.data,
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'data'
                }
            },

            listeners: {
                datachanged: function(store) {
                    var me = this, recs = store.getRange(), data = me.dmpSerialize(recs);

                    me.fireEvent('plugindatachanged', me, data);
                },
                scope: me
            }
        });
        //}

        if (!Ext.getStore('KeywordNodes')) {
            Ext.create('Ext.data.TreeStore', {
                model: 'KeywordNode',
                storeId: 'KeywordNodes',
                clearOnLoad: true,
                root: {
                    expanded: true,
                    "children": [{
                        "children": null,
                        "text": "Science Keywords",
                        "id": "",
                        "iconCls": "",
                        "leaf": false,
                        "draggable": false,
                        "keywordid": "1eb0ea0a-312c-4d74-8d42-6f1ad758f999",
                        "definition": null,
                        "parentkeywordid": null,
                        "fullname": "Science Keywords",
                        "parentname": null,
                        "cls": "pts-tree-branch",
                        "allowDrag": false
                    }],
                    "text": ".",
                    "id": "root",
                    "iconCls": "",
                    "leaf": false,
                    "draggable": false
                },
                defaultRootId: ''
            });
        }
        if (!Ext.getStore('Keywords')) {
            Ext.create('Ext.data.Store', {
                model: 'KeywordNode',
                storeId: 'Keywords',
                autoLoad: false,
                remoteSort: true,
                remoteFilter: true,
                sorters: {
                    property: 'text',
                    direction: 'ASC'
                },

                proxy: {
                    type: 'jsonp',
                    //url : 'http://localhost:8088/keywordlist',
                    url: 'http://gcmd.herokuapp.com/keywordlist',
                    reader: {
                        type: 'json',
                        root: 'data'
                    }
                }
            }).load();
        }

        keywordtree = {
            xtype: 'treepanel',
            itemId: 'keywordTree',
            title: 'Keyword Tree',
            rootVisible: false,
            store: 'KeywordNodes',
            multiSelect: true,
            singleExpand: true,
            cls: 'dmp-keyword-tree',
            hideHeaders: true,
            viewConfig: {
                copy: true,
                plugins: {
                    ptype: 'treeviewdragdrop',
                    dragGroup: 'keywords'
                },
                loadMask: false
            },
            columns: [{
                xtype: 'treecolumn',
                text: 'Keyword',
                dataIndex: 'text',
                flex: 1
            }, helpCol, addCol]
        };

        Ext.applyIf(me, {
            dmpPlugin: true,
            items: [{
                xtype: 'gridpanel',
                itemId: 'planKeywords',
                region: 'center',
                multiSelect: true,
                hideHeaders: true,
                viewConfig: {
                    stripeRows: false,
                    plugins: {
                        ptype: 'gridviewdragdrop',
                        dropGroup: 'keywords',
                        dragGroup: 'deletekeywords',
                        pluginId: 'ddkeywords'
                    },
                    listeners: {
                        beforedrop: {
                            fn: testDuplicate,
                            scope: this
                        }
                    }
                },
                store: keywordStore,
                columns: [{
                    xtype: 'templatecolumn',
                    width: 28,
                    text: '',
                    hideable: false,
                    tpl: removeTpl,
                    action: 'removekeyword',
                    listeners: {
                        click: {
                            fn: rmKeyword
                        }
                    }
                }, {
                    text: "Keyword",
                    flex: 1,
                    sortable: true,
                    dataIndex: 'text'
                }],
                title: 'Keywords',
                dockedItems: [{
                    xtype: 'toolbar',
                    dock: 'top',
                    items: [{
                        xtype: 'button',
                        glyph: 'xf100@FontAwesome',
                        text: 'Remove All',
                        action: 'removeallkeywords',
                        handler: function(btn) {
                            btn.up('gridpanel').getStore().removeAll();
                        }
                    }]
                }]
            }, {
                xtype: 'tabpanel',
                //plain: true,
                flex: 1,
                title: 'Keywords',
                header: false,
                region: 'west',
                split: true,
                activeTab: 0,
                tabPosition: 'top',
                items: [keywordtree, {
                    xtype: 'gridpanel',
                    itemId: 'keywordSearch',
                    cls: 'dmp-keyword-grid',
                    title: 'Search',
                    store: 'Keywords',
                    hideHeaders: true,
                    columns: [{
                        xtype: 'gridcolumn',
                        dataIndex: 'text',
                        flex: 1,
                        text: 'Keyword',
                        renderer: function(value, metaData, record, rowIdx, colIdx, store, view) {
                            var fullname = record.get('fullname');

                            if (fullname) {
                                return '<span class="dmp-row-draggable" data-qtip="' + fullname + '">' + value + '</span>';
                            }
                            return value;
                        }
                    }, {
                        xtype: 'gridcolumn',
                        hidden: true,
                        dataIndex: 'fullname',
                        flex: 2,
                        text: 'Full Path'
                    }, //
                    helpCol, //
                    addCol//
                    ],
                    viewConfig: {
                        copy: true,
                        plugins: {
                            ptype: 'gridviewdragdrop',
                            dragGroup: 'keywords'
                        }
                    },
                    dockedItems: [{
                        xtype: 'filterbar',
                        searchStore: 'Keywords',
                        dock: 'top'
                    }, {
                        xtype: 'pagingtoolbar',
                        displayInfo: true,
                        store: 'Keywords',
                        dock: 'top'
                    }]
                }]
            }]
        });

        me.callParent(arguments);
    }
});
