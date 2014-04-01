Ext.define('DMPlanner.model.Plan', {
    extend: 'Ext.ux.data.DeepModel',

    requires: [//
    'Ext.data.association.HasMany', //
    'Ext.ux.data.DeepJsonWriter', //
    'Ext.ux.data.DeepModel'//
    ],

    uses: ['DMPlanner.model.Section'],

    associations: [{
        type: 'hasMany',
        model: 'DMPlanner.model.Section',
        primaryKey: 'id',
        foreignKey: 'planId',
        autoLoad: true,
        associationKey: 'sections',
        name: 'sections',
        storeConfig: {
            storeId: 'Sections'
        }
    }],

    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },

    fields: [{
        name: 'id'
    }, {
        name: 'version'
    }, {
        name: 'name'
    }, {
        name: 'code'
    }]
});