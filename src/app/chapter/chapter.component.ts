import { Component, OnInit, Input, ElementRef, HostListener } from '@angular/core';
import * as d3 from 'd3';
import { Chapter, ChapterEvent } from '../models/chapter';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-chapter',
  imports:[RouterModule, CommonModule],
  templateUrl: './chapter.component.html',
  styleUrls: ['./chapter.component.css']
})
export class ChapterComponent implements OnInit {
  public rawData?: Chapter;
  public placedNode: ChapterEvent[] = [];
  public windowWidth = window.innerWidth;
  public windowHeight = window.innerHeight;

  public showDetails: boolean = false;
  public selectedEvent?: ChapterEvent;

  constructor(private el: ElementRef, private http: HttpClient) {}

  @HostListener('window:resize', ['$event.target.innerWidth', '$event.target.innerHeight'])
  onResize(width: number, height: number) {
    this.windowWidth = width;
    this.windowHeight = height;
    this.redraw();
  }

  writeText(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, 
    node: ChapterEvent,
    fontSize: number) {
    node.title.forEach((t, index) => {
      svg.append("text")
        .attr("x", node.cx + 14)
        .attr("y", (node.cy + (index * (fontSize + 2))) + 2)
        .style("font-size", fontSize+"px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .text(t);
      svg.append("text")
        .attr("x", node.cx + 14)
        .attr("y", (node.cy + (index * (fontSize + 2))))
        .style("font-size", fontSize+"px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .text(t);
      svg.append("text")
        .attr("x", node.cx + 12)
        .attr("y", (node.cy + (index * (fontSize + 2))))
        .style("font-size", fontSize+"px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .text(t);
      svg.append("text")
        .attr("x", node.cx + 12)
        .attr("y", (node.cy + (index * (fontSize + 2))) + 2)
        .style("font-size", fontSize+"px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .text(t);
      svg.append("text")
        .attr("x", node.cx + 13)
        .attr("y", (node.cy + (index * (fontSize + 2))) + 1)
        .style("font-size", fontSize+"px")
        .style("font-weight", "bold")
        .text(t);
    })
  }

  redraw() {
    if(this.rawData){
      const element = this.el.nativeElement.querySelector('#chapter-container');
      d3.select(element).select('svg').remove()
      const svg = d3.select(element)
                    .append('svg')
                    .attr('width', '100vw')
                    .attr('height', this.windowHeight+'px');
      // Aggiungi le colonne (rettangoli con immagine di sfondo)
      const defs = svg.append("defs");
      this.rawData.images.forEach((image, index) => {
        let leftCrop = image.leftCrop || 0;
        let rightCrop = image.rightCrop || 0;
        let topCrop = image.topCrop || 0;
        let bottomCrop = image.bottomCrop || 0;
        let ratio = this.windowHeight/(image.imageHeight-topCrop-bottomCrop);
        defs.append("pattern")
          .attr("id", `bg${index}`)
          .attr("x", (-leftCrop * ratio) + (index * (this.windowWidth < this.windowHeight ? this.windowWidth : this.windowWidth/4)))
          .attr("y", -topCrop * ratio)
          .attr('width',image.imageWidth * ratio)
          .attr('height', this.windowHeight+topCrop+bottomCrop)
          .attr('patternUnits', 'userSpaceOnUse')
          .append("image")
          .attr("href", image.url)
          .attr('width', image.imageWidth * ratio)
          .attr('height', this.windowHeight+topCrop+bottomCrop);
        }
      );
      this.rawData.images.forEach((image, index) => {
        svg.append('rect')
          .attr('x', index * (this.windowWidth < this.windowHeight ? this.windowWidth : this.windowWidth/4))
          .attr('y', 0)
          .attr('width', (this.windowWidth < this.windowHeight ? this.windowWidth : this.windowWidth/4))
          .attr('height', this.windowHeight)
          .style('fill', `url(#bg${index})`);

          const nodes = image.events;
          let y = 0;
      
          nodes.forEach(node => {
            y = y + 100;
            if(!node.id) return;
            node.cy = y;
            node.cx = 50 + (index * (this.windowWidth < this.windowHeight ? this.windowWidth : this.windowWidth/4));
            svg.append('circle')
              .attr('cx', node.cx)
              .attr('cy', node.cy)
              .attr('r', 10)
              .on('click', () => this.openDetailsModal(node));
            this.placedNode.push(node);
            this.writeText(svg, node, 20);
          });
        }
      )
  
      const links = this.rawData.connections;
  
      links.forEach(link => {
        let startNode = this.placedNode.find(node => node.id === link.start);
        let endNode = this.placedNode.find(node => node.id === link.end);
        const offset = 75
        if(startNode && endNode){
          let path = `M ${startNode.cx},${startNode.cy} C `
          if(startNode.cx != endNode.cx){
            if(startNode.cy >= endNode.cy){
              path = path + `${startNode.cx},${startNode.cy - offset} ${endNode.cx},${startNode.cy} `
            }else{
              path = path + `${startNode.cx},${startNode.cy + offset} ${endNode.cx},${startNode.cy} `
            }
          }else{
            path = path + `${startNode.cx - offset},${startNode.cy} ${startNode.cx - offset},${endNode.cy} `
          }
          path = path + `${endNode.cx},${endNode.cy}`;
          svg.append('path')
          .attr('d', path)
          .attr('stroke', link.color || '#000')
          .attr('stroke-width', 2)
          .attr('fill', 'none');
        }else if(!startNode && endNode){
          svg.append('path')
          .attr('d', `M ${endNode.cx},${endNode.cy} C ${endNode.cx},${endNode.cy - offset} ${endNode.cx - offset},${0} ${endNode.cx - offset},${0}`)
          .attr('stroke', link.color || '#000')
          .attr('stroke-width', 2)
          .attr('fill', 'none');
        }else if(startNode && !endNode){
          svg.append('path')
          .attr('d', `M ${startNode.cx},${startNode.cy} C ${startNode.cx},${startNode.cy - offset} ${startNode.cx - offset},${0}`)
          .attr('stroke', link.color || '#000')
          .attr('stroke-width', 2)
          .attr('fill', 'none');
        }
      });
    }
  }

  ngOnInit() {
    this.http.get<Chapter>('assets/chapters/chapter-0.json').subscribe(data => {
      if(data){
        this.rawData = data;
        this.redraw();
      }
    })
    
  }

  openDetailsModal(node: ChapterEvent) {
    this.selectedEvent = node;
    this.showDetails = true;
  }

  closeDetailsModal() {
    this.selectedEvent = undefined;
    this.showDetails = false;
  }
}
