import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export interface TopologyNode extends d3.SimulationNodeDatum {
  id: string;
  group: 'authority' | 'instrument' | 'account';
  label: string;
  status?: string;
}

export interface TopologyLink extends d3.SimulationLinkDatum<TopologyNode> {
  source: string | TopologyNode;
  target: string | TopologyNode;
  type: string;
}

interface LedgerTopologyProps {
  nodes: TopologyNode[];
  links: TopologyLink[];
  systemFault?: boolean;
  onToggleFault?: () => void;
}

export default function LedgerTopology({ nodes, links, systemFault, onToggleFault }: LedgerTopologyProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    svg.attr("viewBox", [0, 0, width, height]);

    // Define arrow markers for links
    svg.append("defs").selectAll("marker")
      .data(["end"])
      .join("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
      .append("path")
        .attr("fill", "#52525b") // zinc-600
        .attr("d", "M0,-5L10,0L0,5");

    const simulation = d3.forceSimulation<TopologyNode>(nodes)
      .force("link", d3.forceLink<TopologyNode, TopologyLink>(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(30));

    const link = svg.append("g")
      .attr("stroke", "#52525b")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#arrow)");

    const linkLabel = svg.append("g")
      .selectAll("text")
      .data(links)
      .join("text")
      .attr("font-size", "8px")
      .attr("fill", "#a1a1aa") // zinc-400
      .attr("text-anchor", "middle")
      .text(d => d.type);

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", d => d.group === 'authority' ? 12 : d.group === 'instrument' ? 8 : 6)
      .attr("fill", d => {
        if (d.group === 'authority') return '#00f2ff'; // authority-cyan
        if (d.group === 'instrument') return '#ffb800'; // authority-amber
        return '#3f3f46'; // zinc-700
      })
      .attr("stroke", d => d.group === 'authority' ? '#00f2ff' : '#111111')
      .call(drag(simulation) as any);

    const label = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("dy", 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#e4e4e7") // zinc-200
      .attr("font-family", "monospace")
      .text(d => d.label);

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as TopologyNode).x!)
        .attr("y1", d => (d.source as TopologyNode).y!)
        .attr("x2", d => (d.target as TopologyNode).x!)
        .attr("y2", d => (d.target as TopologyNode).y!);

      linkLabel
        .attr("x", d => ((d.source as TopologyNode).x! + (d.target as TopologyNode).x!) / 2)
        .attr("y", d => ((d.source as TopologyNode).y! + (d.target as TopologyNode).y!) / 2 - 5);

      node
        .attr("cx", d => d.x!)
        .attr("cy", d => d.y!);

      label
        .attr("x", d => d.x!)
        .attr("y", d => d.y!);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links]);

  // Drag functionality
  function drag(simulation: d3.Simulation<TopologyNode, undefined>) {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-basalt-950 relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <h2 className="text-[12px] font-black tracking-widest text-zinc-400 font-mono">
          06_NODE_TOPOLOGY_MAP
        </h2>
        <div className="text-[9px] text-zinc-600 font-mono mt-1 uppercase">
          Macro Ledger Oversight & Risk Routing
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={onToggleFault}
          className={`px-4 py-2 border text-[9px] font-black tracking-widest transition-colors ${
            systemFault 
              ? 'bg-mechanical-red text-white border-mechanical-red animate-pulse' 
              : 'bg-basalt-900 text-mechanical-red border-mechanical-red/50 hover:bg-mechanical-red/20'
          }`}
        >
          {systemFault ? 'CLEAR_FAULT' : 'INJECT_FAULT'}
        </button>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 flex gap-4 font-mono text-[9px]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-authority-cyan shadow-[0_0_8px_#00f2ff]"></div>
          <span className="text-zinc-400">AUTHORITY_NODE</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-authority-amber"></div>
          <span className="text-zinc-400">INSTRUMENT</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-700"></div>
          <span className="text-zinc-400">ACCOUNT</span>
        </div>
      </div>

      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
