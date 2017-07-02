var http = require("http");
var url = require("url");
var fs = require("fs");
var Lazy = require("lazy.js");

var server = http.createServer(function(req, res) {
    if (req.url !== "/favicon.ico") {
        var query = url.parse(req.url, true).query;
        var pageCurrent = query.pageCurrent;
        var pageSize = query.pageSize;
        var sortKey = query.sortKey;
        var sortType = query.sortType;
        console.log('pageCurrent:' + pageCurrent);
        console.log('pageSize:' + pageSize);
        console.log('sortKey:' + sortKey);
        console.log('sortType:' + sortType);
        fs.readFile("data.js", "utf-8", function(err, data) {
            var jsonData = JSON.parse(data);
            console.log("----------------");
            var pagedData = getPagedData(jsonData, pageCurrent, pageSize, sortKey, sortType);
            var result = { totalCount: jsonData.length, items: pagedData };
            console.log(result);
            res.writeHead(200, { "Content-Type": "application/json", "charset": "utf-8", "Access-Control-Allow-Origin": "http://127.0.0.1" });
            res.write('callback(' + JSON.stringify(result) + ')');
            res.end();
        });

    }

});

server.listen(1337, "localhost", function() {
    console.log("start listening...");
});



function getPagedData(array, page, rows, sortKey, sortType) {
    if (sortKey && sortType) {
        var descending = sortType == 'desc';
        return Lazy(array).sortBy(s => s[sortKey], descending).skip((page - 1) * rows).take(rows).toArray();
    } else {
        return Lazy(array).skip((page - 1) * rows).take(rows).toArray();
    }
}