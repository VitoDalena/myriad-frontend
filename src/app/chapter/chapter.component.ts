import { Component, OnInit, Input, ElementRef } from '@angular/core';
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
  public placedNode: ChapterEvent[] = [];

  constructor(private el: ElementRef, private http: HttpClient) {}

  ngOnInit() {
    this.http.get<Chapter>('assets/chapters/chapter-0.json').subscribe(data => {
      if(data){
        const element = this.el.nativeElement.querySelector('#chapter-container');
        const width = window.innerWidth;
        const height = window.innerHeight;
        const svg = d3.select(element)
                      .append('svg')
                      .attr('width', '100vw')
                      .attr('height', height+'px');
        // Aggiungi le colonne (rettangoli con immagine di sfondo)
        const defs = svg.append("defs");
        data.images.forEach((image, index) => {

          defs.append("pattern")
            .attr("id", `bg${index}`)
            .attr("x", image.x)
            .attr("y", image.y)
            .attr('width',height)
            .attr('height', height)
            .attr('patternUnits', 'userSpaceOnUse')
            .append("image")
            .attr("href", "/assets/images/immagineSfondo.jpg")
            .attr('width', height)
            .attr('height', height);
          }
        );
        data.images.forEach((image, index) => {
          svg.append('rect')
            .attr('x', index * (width < height ? width : height/3))
            .attr('y', 0)
            .attr('width', (width < height ? width : height/3))
            .attr('height', height)
            .style('fill', `url(#bg${index})`);
  
            const nodes = image.events;
            let y = 0;
        
            nodes.forEach(node => {
              y = y + 100;
              node.cy = y;
              node.cx = 50 + (index * (width < height ? width : height/3));
              svg.append('circle')
                .attr('cx', node.cx)
                .attr('cy', node.cy)
                .attr('r', 10)
                //.attr('fill', node.color || '#007bff')
                .on('click', () => this.showDetails(node));
              this.placedNode.push(node);
            });
          }
        )
    
        const links = data.connections;
    
        links.forEach(link => {
          let startNode = this.placedNode.find(node => node.id === link.start);
          let endNode = this.placedNode.find(node => node.id === link.end);
          if(startNode && endNode){
            svg.append('line')
              .attr('x1', startNode.cx)
              .attr('y1', startNode.cy)
              .attr('x2', endNode.cx)
              .attr('y2', endNode.cy)
              .attr('stroke', link.color || '#000')
              .attr('stroke-width', 2);
          }
        });
    
      }
    })
    
  }

  showDetails(node: any) {
    alert(`Details for ${node.name}`);
  }
}
