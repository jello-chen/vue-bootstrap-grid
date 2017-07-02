var vm = new Vue({
    el: '#example',
    data: {
        url: 'http://127.0.0.1:1337/',
        colModels: [
            { name: 'column1', index: 'column1', label: 'column1', align: 'center', sortable: true },
            { name: 'column2', index: 'column2', label: 'column2', align: 'center', hidden: true },
            { name: 'column3', index: 'column3', label: 'column3' },
            { name: 'column4', index: 'column4', label: 'column4', align: 'left' },
            { name: 'column5', index: 'column5', label: 'column5' },
            { name: 'column6', index: 'column6', label: 'column6', align: 'right', sortable: false },
            { name: 'operation', index: 'operation', label: 'operation', align: 'center', sortable: false }
        ],
        pageSize: 10,
        pageSizeList: [10, 20, 50],
        pageChanged: function() {
            console.log('page changed');
        }
    }
})