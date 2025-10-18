import { Component, OnInit, Input, ElementRef, HostListener } from '@angular/core';
import * as d3 from 'd3';
import { Chapter, ChapterEvent } from '../models/chapter';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventDetailsComponent } from "../event-details/event-details.component";

@Component({
  selector: 'app-chapter',
  imports: [RouterModule, CommonModule, EventDetailsComponent],
  templateUrl: './chapter.component.html',
  styleUrls: ['./chapter.component.css']
})
export class ChapterComponent implements OnInit {
  public rawData?: Chapter;
  public placedNode: ChapterEvent[] = [];
  public windowWidth = window.innerWidth;
  public windowHeight = window.innerHeight;
  public isMobile = window.innerWidth < 768;
  public showDetails: boolean = false;
  public selectedEvent?: ChapterEvent;

  constructor(private el: ElementRef, private http: HttpClient) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this.isMobile = window.innerWidth < 768;
    this.redraw();
  }

  // Calcola dimensioni responsive
  getResponsiveSizes() {
    const isMobile = this.windowWidth < 768 || this.windowHeight > this.windowWidth;
    const isTablet = this.windowWidth >= 768 && this.windowWidth < 1024;
    
    return {
      columnWidth: isMobile ? this.windowWidth * 0.9 : 
                   isTablet ? this.windowWidth / 3 : 
                   this.windowWidth / 4,
      circleRadius: isMobile ? 8 : 10,
      fontSize: isMobile ? (this.windowWidth < 768 ? 22 : 32) : (this.windowWidth < 1440 ? 14 : 20),
      verticalSpacing: isMobile ? 80 : 100,
      horizontalOffset: isMobile ? 30 : 50,
      textOffsetX: isMobile ? 10 : 14,
      pathOffsetX: isMobile ? 60 : 75,
      pathOffsetY: isMobile ? 80 : 100
    };
  }

  writeText(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, 
    node: ChapterEvent,
    fontSize: number,
    textOffsetX: number
  ) {
    const lineHeight = fontSize + 2;
    
    // Testo con bordo nero (outline effect)
    node.title.forEach((t, index) => {
      const y = node.cy + (index * lineHeight);
      
      // Bordo nero (4 copie leggermente spostate)
      const offsets = [[2, 2], [2, 0], [0, 2], [0, 0]];
      offsets.forEach(([dx, dy]) => {
        svg.append("text")
          .attr("x", node.cx + textOffsetX + dx)
          .attr("y", y + dy)
          .style("font-size", fontSize + "px")
          .style("font-weight", "bold")
          .style("fill", "black")
          .style("cursor", "pointer")
          .style("pointer-events", "none")
          .text(t);
      });
      
      // Testo bianco principale
      svg.append("text")
        .attr("x", node.cx + textOffsetX + 1)
        .attr("y", y + 1)
        .style("font-size", fontSize + "px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .style("cursor", "pointer")
        .text(t)
        .on('click', () => this.openDetailsModal(node))
        .on('touchstart', (event) => {
          event.preventDefault();
          this.openDetailsModal(node);
        });
    });
  }

  redraw() {
    if (!this.rawData) return;

    const element = this.el.nativeElement.querySelector('#chapter-container');
    d3.select(element).select('svg').remove();
    this.placedNode = [];

    const sizes = this.getResponsiveSizes();
    const width = sizes.columnWidth * this.rawData.images.length;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + 'px')
      .attr('height', this.windowHeight + 'px');

    // Definizioni pattern per immagini di sfondo
    const defs = svg.append("defs");
    
    this.rawData.images.forEach((image, index) => {
      const leftCrop = image.leftCrop || 0;
      const rightCrop = image.rightCrop || 0;
      const topCrop = image.topCrop || 0;
      const bottomCrop = image.bottomCrop || 0;
      const ratio = this.windowHeight / (image.imageHeight - topCrop - bottomCrop);
      
      defs.append("pattern")
        .attr("id", `bg${index}`)
        .attr("x", (-leftCrop * ratio) + (index * sizes.columnWidth))
        .attr("y", -topCrop * ratio)
        .attr('width', image.imageWidth * ratio)
        .attr('height', this.windowHeight + topCrop + bottomCrop)
        .attr('patternUnits', 'userSpaceOnUse')
        .append("image")
        .attr("href", image.url)
        .attr('width', image.imageWidth * ratio)
        .attr('height', this.windowHeight + topCrop + bottomCrop);
    });

    // Disegna colonne con eventi
    this.rawData.images.forEach((image, index) => {
      svg.append('rect')
        .attr('x', index * sizes.columnWidth)
        .attr('y', 0)
        .attr('width', sizes.columnWidth)
        .attr('height', this.windowHeight)
        .style('fill', `url(#bg${index})`);

      const nodes = image.events;
      let y = 0;

      nodes.forEach(node => {
        y += sizes.verticalSpacing;
        if (!node.id) return;

        node.cy = y;
        node.cx = sizes.horizontalOffset + (index * sizes.columnWidth);

        // Cerchio esterno bianco
        svg.append('circle')
          .attr('cx', node.cx)
          .attr('cy', node.cy)
          .attr('r', sizes.circleRadius)
          .style("cursor", "pointer")
          .style("fill", "white")
          .on('click', () => this.openDetailsModal(node))
          .on('touchstart', (event) => {
            event.preventDefault();
            this.openDetailsModal(node);
          });

        // Cerchio interno colorato
        svg.append('circle')
          .attr('cx', node.cx)
          .attr('cy', node.cy)
          .attr('r', sizes.circleRadius - 2)
          .style("cursor", "pointer")
          .style("fill", "#2d5f7f")
          .on('click', () => this.openDetailsModal(node))
          .on('touchstart', (event) => {
            event.preventDefault();
            this.openDetailsModal(node);
          });

        this.placedNode.push(node);
        this.writeText(svg, node, sizes.fontSize, sizes.textOffsetX);
      });
    });

    // Disegna connessioni
    const links = this.rawData.connections;

    links.forEach(link => {
      const startNode = this.placedNode.find(node => node.id === link.start);
      const endNode = this.placedNode.find(node => node.id === link.end);

      if (startNode && endNode) {
        let path = `M ${startNode.cx},${startNode.cy} C `;
        
        if (startNode.cx !== endNode.cx) {
          if (startNode.cy >= endNode.cy) {
            path += `${startNode.cx},${startNode.cy - sizes.pathOffsetY} ${endNode.cx},${startNode.cy} `;
          } else {
            path += `${startNode.cx},${startNode.cy + sizes.pathOffsetY} ${endNode.cx},${startNode.cy} `;
          }
        } else {
          const xOffset = (sizes.pathOffsetX / 4) * ((endNode.cy - startNode.cy) / 100);
          path += `${startNode.cx - xOffset},${startNode.cy} ${startNode.cx - xOffset},${endNode.cy} `;
        }
        
        path += `${endNode.cx},${endNode.cy}`;
        
        svg.append('path')
          .attr('d', path)
          .attr('stroke', link.color || '#000')
          .attr('stroke-width', this.isMobile ? 3 : 2)
          .attr('fill', 'none');
          
      } else if (!startNode && endNode) {
        // Connessione dall'alto
        let offset = Math.random() * 300;
        svg.append('path')
          .attr('d', `M ${endNode.cx},${endNode.cy} C ${endNode.cx},${endNode.cy - sizes.pathOffsetY} ${endNode.cx - (sizes.pathOffsetX + offset)},${0} ${endNode.cx - (sizes.pathOffsetX +offset)},${0}`)
          .attr('stroke', link.color || '#000')
          .attr('stroke-width', this.isMobile ? 3 : 2)
          .attr('fill', 'none');
      } else if (startNode && !endNode) {
        // Connessione verso l'alto
        svg.append('path')
          .attr('d', `M ${startNode.cx},${startNode.cy} C ${startNode.cx},${startNode.cy - sizes.pathOffsetY} ${startNode.cx - sizes.pathOffsetX},${0}`)
          .attr('stroke', link.color || '#000')
          .attr('stroke-width', this.isMobile ? 3 : 2)
          .attr('fill', 'none');
      }
    });
  }

  ngOnInit() {
    const url = new URL(window.location.href);
    const path = url.pathname.split('/').filter(x => x !== '');
    const chapterId = path[path.length - 1];
    
    this.http.get<Chapter>('assets/chapters/chapter-' + chapterId + '.json').subscribe(data => {
      if (data) {
        this.rawData = data;
        this.redraw();
      }
    });
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