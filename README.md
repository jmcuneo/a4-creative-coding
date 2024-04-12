## Golf

http://a4-andrewsalls.glitch.me

The goal of this application was to create a miniature physics engine to create a 2D game of golf.
![image](https://github.com/AndrewSalls/a4-creative-coding/assets/77992504/f8caecb5-d869-4838-afcf-6382d84a8310)

The two main challenges were making sure my math was correct, or good enough, and dealing with variable screen sizes. I wanted the physics to be consistent across screen sizes, so I needed to scale everything by the screen width and height. For example, a simple implementation would have the ball move by the force vector every frame, but this would cause the ball to move much faster on smaller screens. I changed this to calculate the force vector as a percentage of the total canvas size. This had to be done for all of the parameters.

There are three levels. The reddish colored background signifies that gravity is reversed in that area. The goal is to reach the green area.
![image](https://github.com/AndrewSalls/a4-creative-coding/assets/77992504/2394800b-718f-4400-9f2e-1daae9f4b75b)

Lastly, for the user interface, I expose all of the parameters related to the ball. I don't know why, but for some reason when you enter an invalid value it doesn't set the value to the nearest step like the input should by default, so for clarity I include the minimum and maximum values possible here (anything smaller or larger just gets rounded, even though it doesn't show it):
- radius: can be between 1 and 100. Having a radius large enough to clip into walls breaks collision, and in general collision does not work too well with large radii.
- gravity: can be between 0 and 1. 0 disables gravity, which has some strange effects overall.
- max velocity: can be between 0 and 1. 0 prevents the ball from moving.
- color: can be any color.
![image](https://github.com/AndrewSalls/a4-creative-coding/assets/77992504/0094156b-32fd-4e4c-89cb-135eae8a6dd3)
