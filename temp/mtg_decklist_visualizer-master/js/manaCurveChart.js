function manaCurveChart() {
  // defaults.
  var graphWidth = 155, graphHeight = 100;
      margin = {top: 20, right: 20, bottom: 20, left: 20},
      width = graphWidth - margin.left - margin.right,
      height = graphHeight - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .05);

  var y = d3.scale.linear()
      .range([height, 0]);

  function chart(selection) {
    selection.each(function(data) {

      // Create the svg element we will render into.
      var svg = d3.select(this).append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .attr("xmlns", "http://www.w3.org/2000/svg")
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x.domain(data.map(function(d, i) { return i; }));
      y.domain([0, d3.max(data, function(d) { return d; })]);

      // Create a group for each bar in the dataset.
      // Must create a group that way we can later append 
      // the rect and text as a child.
      // svg text will not show up when appended to a rect.
      var bar = svg.selectAll("g")
          .data(data)
        .enter().append("g")
          .attr("transform", function(d, i) { return "translate(" + x(i) + ",0)"; });

      bar.append("line")
          .attr("stroke", "rgb(188, 187, 187)")
          .attr("x1", x.rangeBand() / 2)
          .attr("x2", x.rangeBand() / 2)
          .attr("y1", function(d, i) { return y(d); })
          .attr("y2", height);

      // Append the count above each rectangle in the bar chart.
      var font = "10px Lato";
      var padding = 4;
      bar.append("text")
            .style("fill", "black")
            .style("font", font)
            .style("text-anchor", "middle")
            .attr("x", function(d, i) { return x.rangeBand() / 2; })
            .attr("y", function(d, i) { return y(d) - padding; })
            .text(function(d) { if (d !== 0) return d; });

      svg.append("text")
          .style("font", font)
          .attr("x", -20)
          .attr("y", height + 3)
          .text("cmc");
  
      // Create a group to position the axis
      var axisGroup = svg.append("g")
                          .attr("transform", "translate(0," + height + ")");
        
      // Draw the text below each axis tick
      var gray = "rgb(188, 187, 187)";
      var xAxisData = [0, 1, 2, 3, 4, 5, 6, 7];
      axisGroup.selectAll("text")
        .data(xAxisData)
      .enter().append("text")
        .style("fill", "black")
        .style("font", font)
        .style("text-anchor", "middle")
        .attr("x", function(d, i) { return x(i) + x.rangeBand() / 2; })
        .attr("dy", "1.0em")
        .text(function(d) { return d; });
 
      // Draw the horizontal x-axis
      axisGroup.append("line")
        .attr("x1", 0).attr("x2", width)
        .style("fill", "none")
        .style("stroke", "black")
        .style("shape-rendering", "crispEdges");   
    });
  }

  chart.width = function() {
    return graphWidth;
  }

  chart.height = function() {
    return graphHeight;
  }

  return chart;
}
