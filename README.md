## Conway's Game of Life: The Musical

[Link](https://a4-milojacobs.glitch.me/)

Conway's Game of Life: The Musical is an implementation of Conway's Game of Life and Grid Sonification. It uses both the Canvas API and the Web Audio API. The application behaves somewhat like a sequencer when you hit
space by running through the grid and playing the corresponding notes. Then it runs a single iteration of Conway's game of life and continues. The grid sonification works by starting at middle A, incrementing by a
perfect fifth when moving vertically, and incrementing by a major third when moving horizontally. 

The biggest challenge in realizing this application was working with the web audio API for the first time and understanding how the nodes work together. However, it was well-documented and I was able to do it without too much difficulty.