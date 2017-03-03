function colorPieChart() {
  var width = 150,
      height = 150,
      radius = Math.min(width, height) / 2;

  var color = d3.scale.ordinal()
      .domain(["colorless", "black", "blue", "green", "red", "white"])
      .range( ["#c9c4be", "#bab1ab", "#c1d7e9", "#a3c095", "#e49977", "#f8f6d8"]);

  var percentange = d3.format("2%");

  function chart(selection) {
    selection.each(function(data) {
      var filteredData = data.filter(function(d) {
        return d.count > 0;
      });

      var arc = d3.svg.arc()
        .outerRadius(radius)
        .innerRadius(radius - 40);

      var pie = d3.layout.pie()
          .sort(null)
          .value(function(d) { return d.count; });

      var svg = d3.select(this).append("svg")
          .attr("width", width)
          .attr("height", height)
          .attr("xmlns", "http://www.w3.org/2000/svg")
        .append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      var g = svg.selectAll(".arc")
      .data(pie(filteredData))
      .enter().append("g")
      .attr("class", "arc");

      g.append("path")
        .attr("d", arc)
        .style("fill", function(d, i) { return color(d.data.color); });

      g.append("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .style("fill", "black")
        .style("font", "10px Lato")
        .style("text-anchor", "middle")
        .text(function(d) {
          var angle = d.endAngle - d.startAngle;
          return percentange(angle / (2.0 * Math.PI)); 
        });

      g.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", radius - 40)
        .style("fill", "white");
    });
  }

  chart.width = function() {
    return width;
  }

  chart.height = function() {
    return height;
  }

  return chart;
}