import { Component, OnInit, Input, ElementRef, HostListener } from '@angular/core';
import * as d3 from 'd3';
import { Chapter, ChapterEvent } from '../models/chapter';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chapter',
  standalone: true,
  templateUrl: './chapter.component.html',
  styleUrls: ['./chapter.component.css']
})
export class ChapterComponent implements OnInit {
  public rawData?: Chapter;
  public placedNode: ChapterEvent[] = [];
  public windowWidth = window.innerWidth;
  public windowHeight = window.innerHeight;

  constructor(private el: ElementRef, private http: HttpClient) {}

  @HostListener('window:resize', ['$event.target.innerWidth', '$event.target.innerHeight'])
  onResize(width: number, height: number) {
    this.windowWidth = width;
    this.windowHeight = height;
    this.redraw();
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
          .attr("x", (-leftCrop * ratio) + (index * (this.windowWidth < this.windowHeight ? this.windowWidth : this.windowHeight/3)))
          .attr("y", -topCrop * ratio)
          .attr('width',this.windowHeight)
          .attr('height', this.windowHeight)
          .attr('patternUnits', 'userSpaceOnUse')
          .append("image")
          .attr("href", "/assets/images/immagineSfondo.jpg")
          .attr('width', image.imageWidth * ratio)
          .attr('height', this.windowHeight+topCrop+bottomCrop);
        }
      );
      this.rawData.images.forEach((image, index) => {
        svg.append('rect')
          .attr('x', index * (this.windowWidth < this.windowHeight ? this.windowWidth : this.windowHeight/3))
          .attr('y', 0)
          .attr('width', (this.windowWidth < this.windowHeight ? this.windowWidth : this.windowHeight/3))
          .attr('height', this.windowHeight)
          .style('fill', `url(#bg${index})`);

          const nodes = image.events;
          let y = 0;
      
          nodes.forEach(node => {
            y = y + 100;
            node.cy = y;
            node.cx = 50 + (index * (this.windowWidth < this.windowHeight ? this.windowWidth : this.windowHeight/3));
            svg.append('circle')
              .attr('cx', node.cx)
              .attr('cy', node.cy)
              .attr('r', 10)
              //.attr('fill', node.color || '#007bff')
              .on('click', () => this.showDetails(node));
            this.placedNode.push(node);
            svg.append("text")
            .attr("x", node.cx + 14)
            .attr("y", node.cy + 2)
            .style("font-size", "16px")
            .style("fill", "white")
            .text(node.title);
            svg.append("text")
            .attr("x", node.cx + 12)
            .attr("y", node.cy)
            .style("font-size", "16px")
            .style("fill", "white")
            .text(node.title);
            svg.append("text")
            .attr("x", node.cx + 13)
            .attr("y", node.cy + 1)
            .style("font-size", "16px")
            .text(node.title);
          });
        }
      )
  
      const links = this.rawData.connections;
  
      links.forEach(link => {
        let startNode = this.placedNode.find(node => node.id === link.start);
        let endNode = this.placedNode.find(node => node.id === link.end);
        if(startNode && endNode){
          let path = `M ${startNode.cx},${startNode.cy} C `
          // TODO linking algorithm
          if(startNode.cx != endNode.cx){
            if(startNode.cy > endNode.cy){
              
            }else if(startNode.cy < endNode.cy){
              
            }else{
              path = path + `${endNode.cx},${startNode.cy} ${endNode.cx + 100},${startNode.cy} ${endNode.cx},${endNode.cy}`
            }
            path = path + `${endNode.cx},${startNode.cy} ${endNode.cx + 100},${startNode.cy} ${endNode.cx},${endNode.cy}`
          }
          // TODO add text
          svg.append('path')
          .attr('d', `M ${startNode.cx},${startNode.cy} 
                      C ${endNode.cx},${startNode.cy} 
                        ${endNode.cx + 100},${startNode.cy} 
                        ${endNode.cx},${endNode.cy}`)
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

  showDetails(node: any) {
    alert(`Details for ${node.name}`);
  }
}
