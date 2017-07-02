Vue.component('vb-grid', {
    template: `<div>
                    <div class="panel panel-default">
                    <div class="panel-heading" v-if="title">{{title}}</div>
                        <table class="table table-bordered table-responsive table-striped">
                            <thead>
                                <tr>
                                    <th v-for="colModel in colModels" @click="sortBy(colModel)" :class="['text-'+(colModel.headAlign || 'center'),{ active: sortKey == colModel.name }]" v-show="!colModel.hidden">{{colModel.label}}<span v-if="changeSortable(colModel.sortable)" class="arrow" :class="sortOrders[colModel.name] > 0 ? 'asc' : 'desc'"></span></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in items">
                                    <td v-for="colModel in colModels" :class="'text-'+(colModel.align || 'left')" v-show="!colModel.hidden">{{item[colModel.name]}}</td>
                                </tr>
                                <tr v-if="items.length == 0">
                                    <td :colspan="colModels.length" class="text-center">{{convertedNoRecordText}}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="pager">
                        <span class="form-inline">
                            <select class="form-control" v-on:change="changePageSize" v-model="vPageSize" number>
                                <option v-if="isArryEmpty(pageSizeList)" :value="vPageSize" selected>{{vPageSize}}</option>
                                <option v-for="row in pageSizeList" :value="row" :selected="row | getSelectedState(vPageSize)">{{row}}</option>
                            </select>
                        </span>
                        <span class="btn btn-default" :class="{'disabled' : convertedPageCurrent <= 1}" v-on:click="showFirst">
                            First
                        </span>
                        <span class="btn btn-default" :class="{'disabled' : convertedPageCurrent <= 1}" v-on:click="showPrevious">
                            Previous
                        </span>
                        <span class="form-inline">
                            <span>Page</span>
                            <input class="pageIndex form-control" value="1" style="width:60px;text-align:center" type="text" v-model="pageCurrent" v-on:input="validateNumber" v-on:keyup.enter="showPage" number/>
                            <span>of</span> {{pageCount}}
                        </span>
                        <span class="btn btn-default" :class="{'disabled' : convertedPageCurrent >= pageCount}" v-on:click="showNext">
                            Next
                        </span>
                        <span class="btn btn-default" :class="{'disabled' : convertedPageCurrent >= pageCount}" v-on:click="showLast">
                            Last
                        </span>
                        <span>View {{startIndex}} - {{endIndex}} of {{totalCount}}</span>
                    </div>
               </div>`,
    props: {
        title: {
            type: String
        },
        url: {
            type: String,
            required: true
        },
        colModels: {
            type: Array,
            required: true
        },
        noRecordText: {
            type: String
        },
        pageSize: {
            type: Number,
            required: true
        },
        pageSizeList: {
            type: Array
        },
        data: {
            type: Object
        }
    },
    data: function() {
        var sortOrders = {};
        var that = this;
        that.colModels.forEach(function(cm) {
            if (!cm.hidden && that.changeSortable(cm.sortable)) {
                sortOrders[cm.name] = 1;
            }
        });
        return {
            sortKey: '',
            sortOrders: sortOrders,
            pageCurrent: 1,
            vPageCurrent: this.pageCurrent,
            vPageSize: this.pageSize,
            totalCount: 0,
            pageCount: 0,
            items: []
        }
    },
    mounted: function() {
        this.bindData();
    },
    filters: {
        getSelectedState: function(value, current) {
            return current == value ? 'selected' : '';
        }
    },
    computed: {
        convertedNoRecordText: function() {
            return this.noRecordText == undefined ? 'No data' : this.noRecordText;
        },
        convertedPageCurrent: function() {
            return this.vPageCurrent == undefined ? (this.vPageCurrent = 1) : this.vPageCurrent;
        },
        disabledStyle: function() {
            return this.vPageCurrent <= 1 ? 'disabled' : '';
        },
        startIndex: function() {
            return (this.convertedPageCurrent - 1) * this.vPageSize + 1;
        },
        endIndex: function() {
            return Math.min(this.convertedPageCurrent * this.vPageSize, this.totalCount);
        },
        sortType: function() {
            return this.sortOrders[this.sortKey] > 0 ? 'asc' : 'desc';
        }
    },
    methods: {
        validateNumber: function() {
            var ev = this.pageCurrent;
            if (ev == '' || isNaN(ev) || ev < 1 || ev > this.pageCount) {
                this.pageCurrent = 1;
            }
        },
        pageChanged: function() {
            this.$emit('page-changed');
        },
        changeSortable: function(value) {
            return value == true || value == undefined;
        },
        isArryEmpty: function(value) {
            return value == undefined || value.length == 0;
        },
        changePageSize: function(event) {
            this.vPageCurrent = 1;
            this.bindData();
        },
        calculatePageCount: function() {
            this.pageCount = Math.ceil(this.totalCount / this.vPageSize);
        },
        bindData: function() {
            this.$nextTick(() => {
                var that = this;
                $.ajax({
                    url: this.url,
                    dataType: "jsonp",
                    data: { pageCurrent: this.convertedPageCurrent, pageSize: this.vPageSize, sortKey: this.sortKey, sortType: this.sortType, data: this.data },
                    type: 'POST',
                    jsonpCallback: 'callback',
                    success: function(result) {
                        that.items = result.items;
                        that.totalCount = result.totalCount;
                    }
                });
            });
        },
        showFirst: function() {
            if (this.vPageCurrent > 1) {
                this.vPageCurrent = 1;
                this.pageChanged();
                this.bindData();
            }
        },
        showPrevious: function() {
            if (this.vPageCurrent > 1) {
                this.vPageCurrent--;
                this.pageChanged();
                this.bindData();
            }
        },
        showNext: function() {
            if (this.vPageCurrent < this.pageCount) {
                this.vPageCurrent++;
                this.pageChanged();
                this.bindData();
            }
        },
        showLast: function() {
            if (this.vPageCurrent < this.pageCount) {
                this.vPageCurrent = this.pageCount;
                this.pageChanged();
                this.bindData();
            }
        },
        showPage: function() {
            var _pageCurrent = parseInt(this.pageCurrent);
            if (_pageCurrent >= 1 && _pageCurrent <= this.pageCount) {
                this.vPageCurrent = _pageCurrent;
                this.pageChanged();
                this.bindData();
            }
        },
        sortBy: function(cm) {
            if (!cm.hidden && this.changeSortable(cm.sortable)) {
                var key = cm.name;
                this.sortKey = key;
                this.sortOrders[key] = this.sortOrders[key] * -1;
                this.bindData();
            }
        }
    },
    watch: {
        vPageCurrent: function(value) {
            this.pageCurrent = value;
        },
        pageSize: function(value) {
            this.vPageSize = value;
        },
        vPageSize: function(value) {
            this.calculatePageCount();
        },
        totalCount: function(value) {
            this.calculatePageCount();
        }
    }
});