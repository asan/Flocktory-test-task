var React = require('react');

var CompanyPlot =
  React.createClass({
    getDefaultProps: function() {
      return {
        width: 500,
        sectionHeight: 50,
        fontSize: 8,
        colors: ['#4a9f2b','#60AE44','#acdf9a','#d7dfd5'],
        rightLegendMargin: 5,
        bottomLegendMargin: 20
      }
    },
    /**
     * Convert series of x coordinates to svg compatable polygon path
     * @param  {array} Array of points
     */
    arrayToPolyLine: function(arr) {
      var sectionHeight = this.props.sectionHeight;
      var len = arr.length;
      str = "";
      for (var i = 0; i<len; i++){
        str += " " + arr[i] + "," + i*sectionHeight;
      }
      str += " " + this.props.width + "," + sectionHeight * (len - 1);
      str += " " + this.props.width + ",0";
      return str;
    },
    /**
     * Convert raw data from:
     * {
     *  "id1":{
     *    "metrics":{
     *      "m1": 1,
     *      "m2": 2,
     *      ...
     *    }
     *  },
     *  "id2": ... 
     * }
     * to:
     * {
     *  "m1": [1,...],
     *  "m2": [2,...]
     * }
     * so we can normalize it for drawing on plot
     * @param  {object} Raw data
     */
    convertData: function(data) {
      var converted = {}
      for(var i in data){
        var obj = data[i].metrics;
        for(var name in obj){
          converted[name] = converted[name] || [];
          converted[name].push(obj[name]);
        }
      }
      return converted;
    },
    /**
     * Counts metrics sum for plot legend
     * @param  {object} Raw data.
     */
    sumsFromData: function(data) {
      var sums = {};
      for(var i in data){
        var arr = data[i];
        var sum = _.reduce(arr, function(sum, num) {
          return sum + num;
        });
        sums[i] = sum;
      }
      return sums;
    },
    /**
     * Extracts mertrics array from data
     * used to sinxhronize plot and legend
     * @param  {object} Raw data.
     */
    getMetrics: function(data) {
      var keys = _.keys(data);
      if(keys.length && data[keys[0]]){
        return _.keys(data[keys[0]].metrics);
      }
      return false;
    },
    /**
     * Normalize data for given plot width, 
     * and translates it to plot coordinates
     * @param  {object} Converted data.
     */
    normalizeData: function(data) {
      var width = this.props.width;
      var normalized = {};
      for(var i in data){
        var arr = data[i];
        var sum = _.reduce(arr, function(sum, num) {
          return sum + num;
        });
        normalized[i] = _.map(arr, function(elem) {
          return Math.floor(elem*width/sum);
        });
      }
      for(var i in normalized){
        var arr = normalized[i];
        var temp = []
        _.reduce(arr, function(sum, num) {
          temp.push(sum);
          return sum+num;
        });
        normalized[i] = temp;
      }
      return normalized;

    },
    /**
     * Transpose normalized data to
     * match arrayToPolyline format
     * @param  {object} Normalized data
     * @param  {object} Metrics names array
     */
    transpose: function(data, metrics) {
      return _.zip(_.map(metrics, function(metric) {return data[metric]}));
    },
    /**
     * Generates colors for plot polygons
     * @param  {int} Color seed
     */
    nextColor: function(i) {
      return this.props.colors[i%this.props.colors.length];
      
    },
    /**
     * Helper for counting companies
     * @param  {object} Raw data
     */
    countCompanies: function(data) {
      var keys = _.keys(data);
      return keys.length;
    },
    render: function(){
      var data = this.props.selected;
      var companiesCount = this.countCompanies(data);

      if(companiesCount == 0){
        return (<h3>Выберите компании для сравнения</h3>)
      }else if(companiesCount == 1) {
        return (<h3>Выберите ещё одну компанию</h3>)
      }

      var metrics = this.getMetrics(data);

      var width = this.props.width;
      var sectionHeight = this.props.sectionHeight;
      var height = sectionHeight * (metrics.length - 1);


      var converted = this.convertData(data);
      var normalized = this.normalizeData(converted);
      var sum_obj = this.sumsFromData(converted);
      var arrays = this.transpose(normalized, metrics);
      
      var polygons = arrays.map(function(array, i) {
        return (<polygon
          points={this.arrayToPolyLine(array)}
          style= {{
            fill: this.nextColor(i),
            stroke:'white',
            strokeWidth: 1
          }}
        />);
      }, this);

      var separators = metrics.map(function(metric, i) {
        return (
          <line x1={0} 
                x2={this.props.width}
                y1={i * sectionHeight}
                y2={i * sectionHeight}
                style={{stroke: 'rgba(255,255,255,0.5)', strokeWidth: 1}}
          />);
      }, this);
        
          
      var fontSize = this.props.fontSize;

      var rightLegend = metrics.map(function(metric, i) {
        var offset = fontSize/2;
        if(i == 0){
          offset = fontSize;
        }else if(i == metrics.length - 1){
          offset = 0;
        }
        return (
          <text 
            x={this.props.width + this.props.rightLegendMargin}
            y={(i * sectionHeight) + offset}
            style={{fill: 'black'}}>
            {sum_obj[metric] + " " + metric}
          </text>
        );
      }, this);

      var bottomPoints = _.map(arrays, function(item) {return _.last(item)});
      var legend = [];
      _.reduce(bottomPoints.concat(width), function(last, num) {
        legend.push(last + (num-last)/2);
        return num;
      },0);
      var i = -1;
      var bottomLegend = _.map(this.props.selected, function(data, key) {
        i+=1;
        var x = legend[i] + fontSize/2;
        var y = height + this.props.bottomLegendMargin;
        return (
          <text x={x}
                y={y}
                style={{fill: 'black'}}
                textAnchor="end"
                transform={"rotate(-90 " + (x) + "," + (y) + ")"}
          >
            {data.title}
          </text>
        );
      }, this);

      return (
        <svg 
            className="app-plot"
            width={width + 150} height={height + 150 + 150} 
            viewPort={"0 0 " + width + 150 + " " + height + 150} version="1.1"
            xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(10,10)">
            <polygon
              points={"0,0 0," + height + ", " + width + "," + height + "," + width + ",0"}
              style={{fill:'#258500'}}
            />
            {polygons}
            {separators}
            {rightLegend}
            {bottomLegend}
          </g>
        </svg>
      );
    }
  });
module.exports = CompanyPlot;

