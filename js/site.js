//configuration object

var config = {
    title:"Vanuatu Cyclone Pam Humanity Road 3W",
    description:"<p>Click the graphs or map to interact.</p><p>Date: 25/03/2015</p><p>Contact: <a href='https://twitter.com/Simon_B_Johnson' target='_blank'>Simon Johnson</a></p><p>Source: <a href='http://humanityroad.org/' target='_blank'>Humanity Road</a></p>",
    data:"data/data.json",
    whoFieldName:"organisation",
    whatFieldName:"activity",
    whereFieldName:"adm2_code",
    geo:"data/vanuatu.geojson",
    joinAttribute:"adm2code",
    colors:['#81d4fa','#4fc3f7','#29b6f6','#FFA000','#039be5','#0288d1','#0277bd','#01579b']
};

//function to generate the 3W component
//data is the whole 3W Excel data set
//geom is geojson file

function generate3WComponent(config,data,geom){    
    
    $('#title').html(config.title);
    $('#description').html(config.description);

    var whoChart = dc.rowChart('#hdx-3W-who');
    var whatChart = dc.rowChart('#hdx-3W-what');   
    var whereChart = dc.leafletChoroplethChart('#hdx-3W-where');

    var cf = crossfilter(data);

    var whoDimension = cf.dimension(function(d){ return d[config.whoFieldName]; });
    var whatDimension = cf.dimension(function(d){ return d[config.whatFieldName]; });
    var whereDimension = cf.dimension(function(d){ return d[config.whereFieldName]; });

    var whoGroup = whoDimension.group();
    var whatGroup = whatDimension.group();
    var whereGroup = whereDimension.group();
    var all = cf.groupAll();

    whoChart.width($('#hdx-3W-who').width()).height(510)
            .dimension(whoDimension)
            .group(whoGroup)
            .elasticX(true)
            .data(function(group) {
                return group.top(20);
            })
            .labelOffsetY(13)
            .colors(config.colors)
            .colorDomain([0,7])
            .colorAccessor(function(d, i){return 3;})
            .xAxis().ticks(5);

    whatChart.width($('#hdx-3W-what').width()).height(230)
            .dimension(whatDimension)
            .group(whatGroup)
            .elasticX(true)
            .data(function(group) {
                return group.top(15);
            })
            .labelOffsetY(13)
            .colors(config.colors)
            .colorDomain([0,7])
            .colorAccessor(function(d, i){return 3;})
            .xAxis().ticks(5);
    

    dc.dataCount('#count-info')
            .dimension(cf)
            .group(all);

    whereChart.width($('#hxd-3W-where').width()).height(400)
            .dimension(whereDimension)
            .group(whereGroup)
            .center([-17.050,168.3000])
            .zoom(6)    
            .geojson(geom)
            .colors(['#CCCCCC', config.colors[3]])
            .colorDomain([0, 1])
            .colorAccessor(function (d) {
                if(d>0){
                    return 1;
                } else {
                    return 0;
                }
            })           
            .featureKeyAccessor(function(feature){
                return feature.properties[config.joinAttribute];
            });
                                
    dc.renderAll();
    
    var g = d3.selectAll('#hdx-3W-who').select('svg').append('g');
    
    g.append('text')
        .attr('class', 'x-axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', $('#hdx-3W-who').width()/2)
        .attr('y', 510)
        .text('Activities');

    var g = d3.selectAll('#hdx-3W-what').select('svg').append('g');
    
    g.append('text')
        .attr('class', 'x-axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', $('#hdx-3W-what').width()/2)
        .attr('y', 250)
        .text('Activities'); 

}

//load 3W data

var dataCall = $.ajax({ 
    type: 'GET', 
    url: config.data, 
    dataType: 'json',
});

//load geometry

var geomCall = $.ajax({ 
    type: 'GET', 
    url: config.geo, 
    dataType: 'json'
});

//when both ready construct 3W

$.when(dataCall, geomCall).then(function(dataArgs, geomArgs){
    var geom = geomArgs[0];
    geom.features.forEach(function(e){
        e.properties[config.joinAttribute] = String(e.properties[config.joinAttribute]); 
    });
    generate3WComponent(config,dataArgs[0],geom);
});

