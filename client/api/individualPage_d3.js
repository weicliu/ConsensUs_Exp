Template.individualPage.onRendered(function() {
    this.autorun(function() {
        var criteria_num = 4;
        var candidate_num = 3;
        var user_num = 6;
        var i = 0, j = 0, k = 0;

        var height = 450, width = 1050;

        var r = 10;

        var svg = d3
        .select('#main_panel')
        .attr("height", height)
        .attr("width", width)
        ;

        svg.append("text")
        .text("Not suitable")
        .attr("transform", "translate(210, 50)");

        svg.append("text")
        .text("Suitable")
        .style("text-anchor", "end")
        .attr("transform", "translate(610, 50)");

        svg.append("text")
        .text("Candidates")
        .attr("transform", "translate(754, 50)");



        var g = svg.append('g')
        .attr("height", height)
        .attr("width", width);

        var data1 = [{rect:0, name:"Overall"},{rect:1, name:"Academic"},{rect:2, name:"Activities"},{rect:3, name:"Recommendation Letter"},{rect:4, name:"Readiness for Engineering"}];

        var title_width = 200;
        var rect_height = 2, rect_width=400;
        var padding_x = 10;
        var padding_y = 70;

        var rect = g
        .selectAll('rect')
        .data(data1)
        .enter()
        .append('g')
        .classed("bar", true)
        .attr("id", function(d) {return "a" + d.rect.toString();})
        ;

        rect
        .append("text")
        .attr("x", title_width)
        .attr("y", function(d){return (d.rect + 1) * padding_y + 5})
        .attr("text-anchor", "end")
        .text(function(d){return d.name;});
        rect
        .append('rect')
        .attr("x", title_width + padding_x)
        .attr("width", rect_width)
        .attr("fill", "#C0C0C0")
        .attr('y', function(d, i){
            if(i == 0)
            return (d.rect + 1) * padding_y - r;
            else
            return (d.rect + 1) * padding_y;
        })
        .attr("height", function(d, i){
            if(i == 0)
            return r * 2;
            return rect_height;
        })
        .attr("rx", function(d, i){
            if(i == 0)
            return r;
            return 0;
        })
        .attr("ry", function(d, i){
            if(i == 0)
            return r;
            return 0;
        })
        ;


        rect
        .append("rect")
        .attr("x", title_width + padding_x)
        .attr("y", function(d, i){
            return (d.rect + 1) * padding_y - padding_y / 2;
        })
        .attr("width", rect_width)
        .attr("height", padding_y)
        .attr("opacity", 0)
        ;

        var color = new Array("#43a853", "#4285f4", "#fbbc05", "BlueViolet", "brown", "Chartreuse", "Cyan");


        var order = FlowRouter.getQueryParam("order");
        if (order == "1") {
            scores = new Array();
            for(k=0;k<=criteria_num;k++){
                scores[k]=new Array();
                for(j=0;j<=candidate_num;j++)
                scores[k][j]=0;

            }

            scores = [
                [0, -1, -1, -1], // overall [invalid, candidate1, candidate2, candidate 3]
                [0, -1, -1, -1],  //criteria 1
                [0, -1, -1, -1],
                [0, -1, -1, -1],
                [0, -1, -1, -1]
            ];
        } else {
            scores = Scores.findOne({userId: Meteor.userId(), order: "1"});
            if (scores === undefined) {
                return;
            }
            scores = scores.score;
        }



        var str = "[";

        for(i = 0; i <= criteria_num; i++){
            for(j = 1; j <=candidate_num; j++){
                str += "{row: ";
                str += i;
                str += ", col: ";
                str += j;
                str += ", score: ";
                str += parseFloat(scores[i][j]);
                str += ", conflict: 0, id:\"";
                str += i;
                str += j;
                str += "\""

                if(i ==criteria_num && j ==candidate_num)
                str += "}";
                else
                str += "},";
            }
        }
        str = str + "]";

        var data2 = eval('(' + str + ')');

        var circle = g
        .selectAll("circle")
        .data(data2)
        .enter()
        .append("g")
        .classed("handler", true)
        .attr("id", function(d) {return "a" + d.id.toString(); });
        circle
        .append("circle")
        .attr("r", r)
        .attr("cx", function(d) {
            if(d.score == -1) {
                return d.x = 600 + d.col * 30;
            }else {
                return d.x = title_width + padding_x + d.score * rect_width /10;
            }


        })
        .attr("cy", function(d, i) { return d.y = padding_y * (d.row + 1); })
        .attr("fill", function(d) {return color[d.col - 1];});

        circle
        .append("path")
        .attr("class", "float_path")
        .attr("d", function(d) {
            return "M " + d.x.toString() + " " + d.y.toString() + "L " + d.x.toString() + " " + d.y.toString();
        })
        .attr("stroke", "grey")
        .attr("stroke-width", "2")
        .attr("opacity", 0.6)
        ;

        circle
        .append("text")
        .attr("class", "voter_score")
        .attr("x", function(d){

            if(d.score == -1){
                return 600 + d.col * 30;
            }
            else{
                return title_width + padding_x + d.score * rect_width / 10;
            }
        })
        .attr("y", function(d){return d.y - 10;})
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text('');

        var defs = svg.append("defs");

        var filter = defs.append("filter")
        .attr("id", "drop-shadow")
        .attr("height", "130%");

        filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 1.1)
        .attr("result", "blur");

        filter.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 0)
        .attr("dy", 0)
        .attr("result", "offsetBlur");

        var feMerge = filter.append("feMerge");

        feMerge.append("feMergeNode")
        .attr("in", "offsetBlur")
        feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");

        circle.selectAll("circle")
        .style("filter", function(d){
            if(d.id[0] == 0)
            return;

            return "url(#drop-shadow)"});



            var float_height = 15;
            var refNode = d3.select("#a01").node();

            //drag behavior
            var drag = d3.behavior.drag()
            .origin(Object)
            .on("dragstart", dragStart)
            .on("drag", dragMove)
            .on('dragend', dragEnd);

            var drag1 = d3.behavior.drag()
            .origin(Object)
            .on("dragstart", function(d){

                d3.event.sourceEvent.preventDefault();

                d3.select(this)
                .append("svg:image")
                .attr('x',function(d){ return d.x + 5;})
                .attr('y',function(d){ return d.y + 5;})
                .attr('width', 20)
                .attr('height', 24)
                .attr("xlink:href","../forbidden-sign.png");

                d3.selectAll(".handler")
                    .select("circle")
                    .style("stroke-width", function(d){
                        console.log(this.parentNode.id);
                        if(this.parentNode.id[1] == 0){
                            return 0;
                        }
                        else{
                            return "2px";
                        }
                    })
                    .style("stroke", function(d){
                        return color[this.parentNode.id[2]-1];
                    });

            })
            .on('dragend', function(d){
                d3.select(this).select("image").remove();
                d3.selectAll(".handler").select("circle").style("stroke-width", 0);
            });

            d3.selectAll(".handler").each(function(d){
                if(d.id[0]!=0){
                    d3.select(this).call(drag);
                }
                else
                d3.select(this).call(drag1);
            })


            d3.selectAll(".handler").select("circle")
            .on("mouseover", function(d){
                if(this.parentNode.id[1] != 0){
                    d3.select(this)
                    .attr("stroke-width", "2px")
                    .attr("stroke", function(d){
                        return color[this.parentNode.id[2]-1];
                    });
                }

                d3.select(this.parentNode).append("text")
                .attr("class", "voter_name")
                .text(function(d){
                    return candid[d.col-1].candid;})
                    .style("text-anchor", "end")
                    .attr("transform", function(d, i){
                        return "translate(" + d.x + "," + (d.y + r + 4) + ") rotate(-40)";
                    });

                })
                .on("mouseout", function(d){

                    (this.parentNode).parentNode.insertBefore((this.parentNode), refNode);
                    refNode = this.parentNode;

                    d3.select(this)
                    .attr("stroke-width", 0);

                    d3.selectAll(".voter_name").remove();

                })
                ;

                d3.selectAll(".bar").on("mouseover", function(d){
                    var row = this.id[1];
                    for(i = 1; i <= candidate_num; i++){

                        var circle_id = "#a" + row.toString() + i.toString();
                        d3.select(circle_id).append("text")
                        .attr("class", "voter_name")
                        .text(function(d) {return candid[i-1].candid;})
                        .style("text-anchor", "end")
                        .attr("transform", function(d, i){

                            return "translate(" + d.x + "," + (d.y + r + 4) + ") rotate(-40)";
                        });
                    }

                })
                .on("mouseout", function(d){
                    d3.selectAll(".voter_name").remove();
                });

                function dragStart(d) {
                    d3.selectAll(".bar").on("mouseover", null);
                    d3.selectAll(".handler").on("mouseover", null);
                    d3.selectAll(".voter_name").remove();



                    d3.event.sourceEvent.preventDefault();

                    this.parentNode.insertBefore(this, refNode);
                    refNode = this;


                    //                        d3.select(this.parentNode).append(this);

                    d3.select(this)
                    .select("circle")
                    .attr("opacity", 0.2)
                    .attr("cy", d.y - float_height);

                    d3.select(this)
                    .select(".float_path")
                    .attr("d", function(d) {
                        return "M" + d.x.toString() + " " + (d.y - 15 + r).toString() + "L " + d.x.toString() + " " + d.y.toString();
                    });

                    d3.select(this)
                    .select(".voter_score")
                    .text(function(d){
                        var x = d3.round((d.x - title_width - padding_x)/rect_width * 10, 1);
                        x = Math.max(0, x);
                        if(x > 10) x = "-";
                        return x;

                    });


                    //text: voter_name
                    d3.select(this)
                    .append("text")
                    .attr("class", "tmp_name")
                    .text(function(d) {
                        return candid[d.col - 1].candid;})
                        .style("text-anchor", "end")
                        .attr("transform", function(d, i){
                            return "translate(" + d.x + "," + (d.y + r + 4) + ") rotate(-40)";
                        })
                        ;


                    }


                    function dragMove(d) {

                        d3.select(this)
                        .select("circle")
                        .attr("opacity", 0.4)
                        .attr("cx",
                        //                          d.x = Math.max(title_width + padding_x, Math.min(title_width + padding_x + rect_width, d3.event.x)))
                        d.x = Math.max(title_width + padding_x, d3.event.x))
                        .attr("cy", d.y - float_height);

                        d3.select(this)
                        .select(".tmp_name")
                        .attr("transform", function(d){
                            //    d.x = Math.max(title_width + padding_x, Math.min(title_width + padding_x + rect_width, d3.event.x));
                            d.x = Math.max(title_width + padding_x, d3.event.x);

                            return "translate(" + d.x + "," + (d.y + r + 4) + ") rotate(-40)";
                        })
                        .text(function(d) {
                            return candid[d.col - 1].candid;});

                            d3.select(this)
                            .select(".float_path")
                            .attr("d", function(d) {
                                return "M" + d.x.toString() + " " + (d.y - 15 + r).toString() + "L " + d.x.toString() + " " + d.y.toString();
                            });

                            d3.select(this)
                            .select(".voter_score")
                            .text(function(d){
                                var x = d3.round((d3.event.x - title_width - padding_x)/rect_width * 10, 1);
                                x = Math.max(0, x);
                                if(x > 10){
                                    x = "-";}
                                    return x;

                                })
                                .attr("x",
                                Math.max(title_width + padding_x, d3.event.x) );

                                //                                    Math.max(title_width + padding_x, Math.min(title_width + padding_x + rect_width, d3.event.x)) );


                                var score_num = d3.round((d.x - title_width - padding_x)/rect_width * 10, 1);
                                if(score_num > 10) score_num = -1;
                                scores[d.row][d.col] = score_num;
                                //php
                                //                           calculateTable();
                                var overall = 0;
                                for(i = 1; i <= criteria_num; i++){
                                    if(scores[i][d.col] == -1) break;       //if any of the criteria is not scored
                                    overall += scores[i][d.col];
                                }

                                if(i == criteria_num + 1)
                                overall /= criteria_num;
                                else
                                overall = -1;

                                scores[0][d.col] = overall;
                                var overall_id = "#a0" + d.col.toString();
                                d3.select(overall_id).select("circle").attr("cx", function(d) {
                                    if(overall == -1){
                                        d.x = 600 + d.col * 30
                                        return d.x;
                                    }
                                    else{
                                        d.x = title_width + padding_x + overall * rect_width /10;
                                        return d.x;
                                    }

                                }

                            );


                        }

                        function dragEnd(d) {
                            d3.select(".tmp_name").remove();


                            d3.select(this)
                            .select('circle')
                            .attr('opacity', 1)
                            .attr("cy", d.y);
                            d3.select(this)
                            .select(".float_path")
                            .attr("d", function(d){
                                return "M" + d.x.toString() + " " + d.y.toString() + "L " + d.x.toString() + " " + d.y.toString();
                            });

                            d3.select(this)
                            .select("text")
                            .text('');



                            var score_num = d3.round((d.x - title_width - padding_x)/rect_width * 10, 1);
                            if(score_num > 10) score_num = -1;
                            scores[d.row][d.col] = score_num;
                            //php
                            //                           calculateTable();
                            var overall = 0;
                            for(i = 1; i <= criteria_num; i++){
                                if(scores[i][d.col] == -1) break;       //if any of the criteria is not scored
                                overall += scores[i][d.col];
                            }

                            if(i == criteria_num + 1)
                            overall /= criteria_num;
                            else
                            overall = -1;

                            scores[0][d.col] = d3.round(overall, 1);
                            var overall_id = "#a0" + d.col.toString();
                            d3.select(overall_id).select("circle").attr("cx", function(d) {
                                if(overall == -1){
                                    d.x = 600 + d.col * 30;
                                    return d.x;
                                }
                                else{
                                    d.x = title_width + padding_x + overall * rect_width /10;
                                    return d.x;
                                }

                            }

                        );


                        //                            save();

                        //recover bar name
                        d3.selectAll(".bar").on("mouseover", function(d){
                            var row = this.id[1];
                            for(i = 1; i <= candidate_num; i++){

                                var circle_id = "#a" + row.toString() + i.toString();
                                d3.select(circle_id).append("text")
                                .attr("class", "voter_name")
                                .text(function(d) {return candid[i-1].candid;})
                                .style("text-anchor", "end")
                                .attr("transform", function(d, i){

                                    return "translate(" + d.x + "," + (d.y + r + 4) + ") rotate(-40)";
                                });
                            }

                        });

                        d3.selectAll(".handler").select("circle")
                        .on("mouseover", function(d){
                            if(this.parentNode.id[1] != 0){
                                d3.select(this)
                                .attr("stroke-width", "2px")
                                .attr("stroke", function(d){
                                    return color[this.parentNode.id[2]-1];
                                });
                            }

                            d3.select(this.parentNode).append("text")
                            .attr("class", "voter_name")
                            .text(function(d){
                                return candid[d.col-1].candid;})
                                .style("text-anchor", "end")
                                .attr("transform", function(d, i){
                                    return "translate(" + d.x + "," + (d.y + r + 4) + ") rotate(-40)";
                                });

                            });

                        }






                        /* legend */
                        var candid = [{candid: "Sam"}, {candid: "Adam"}, {candid: "Jim"}];
                        var legend_height = 15;
                        var legend_padding = 17;
                        var legend = d3
                        .select("#main_panel")
                        .append("g")
                        .attr('id', 'legend')
                        .selectAll("g")
                        .data(candid)
                        .enter()
                        .append('g')
                        .attr("x", 0)
                        .attr("y", function(d, i) {return i * legend_height + 0;})
                        .attr("transform", "translate(" + (title_width + rect_width + 150) + "," + 65 + ")")
                        ;

                        legend.append('circle')
                        .attr('cx', 10)
                        .attr('cy', function(d, i) {
                            return i * legend_height;
                        })
                        .attr("r", 5)
                        .style('fill', function(d, i) { return color[i];})
                        .style('stroke', function(d, i) {return color[i];});

                        legend.append('text')
                        .attr('x', 25)
                        .attr('y', function(d, i) {
                            return i * legend_height + 5;})
                            .text(function(d) { return d.candid; });

                            /* checkbox */
                            var check_box = d3
                            .select("#checkbox_panel")
                            .classed("checkbox", true)
                            .style("position", "absolute")
                            .style("left", 790  + "px")
                            .style("top", function() { return 260 + "px";})
                            .append('input')
                            .attr('type','checkbox')
                            .property("checked", false);

                            d3.select(".checkbox")
                            .append("text")
                            .text("Scale");


                            //axis
                            var xScale = d3.scale.linear().domain([0, 10]).range([title_width + padding_x, title_width + padding_x + rect_width]);

                            var xAxis = d3.svg.axis()
                            .scale(xScale)
                            //            .innerTickSize([8])
                            .outerTickSize([3])
                            //               .tickSize([6, 100])
                            .tickPadding([5])
                            .orient("bottom")
                            .ticks(11)
                            //                 .tickValues([0,null,2,null,4,null,6,null,8,null,10])
                            ;


                            d3.selectAll(".bar").append("g")
                            .attr("transform", function(d, i){
                                var y = (i + 1) * padding_y;
                                return "translate(" + 0 + "," + y + ")"

                            })
                            .classed("axis",true).call(xAxis).style("visibility", "hidden");
                            d3.selectAll(".axis").selectAll("text").style("font-size", "10px");



                            check_box.on("click", function(d){

                                if(this.checked == true){
                                    d3.selectAll(".axis").style("visibility", "visible");
                                }
                                else{
                                    d3.selectAll(".axis").style("visibility", "hidden");
                                }
                            })
                        });
                    });
