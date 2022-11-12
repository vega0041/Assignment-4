/* Assignment 4: So You Think Ants Can Dance
 * CSCI 4611, Fall 2022, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'
import { Skeleton } from './Skeleton'
import { MotionClip } from './MotionClip'
import { Pose } from './Pose';
import { Bone } from './Bone';

export class AnimatedCharacter extends gfx.Transform3
{
    public skeleton: Skeleton;
    public fps: number;
    public useAbsolutePosition: boolean;
    
    private clip: MotionClip | null;
    
    private currentTime: number;
    private currentPose: Pose;
    
    private overlayQueue: MotionClip[];
    private overlayTransitionFrames: number[];
    private overlayTime: number;
    private overlayPose: Pose;

    constructor(fps = 60, useAbsolutePosition = true)
    {
        super();
        
        // Create skeleton and add it as a child
        this.skeleton = new Skeleton();
        this.add(this.skeleton);

        this.fps = fps;
        this.useAbsolutePosition = useAbsolutePosition;

        this.clip = null;

        this.currentTime = 0;
        this.currentPose = new Pose();
        
        this.overlayQueue = [];
        this.overlayTransitionFrames = [];
        this.overlayTime = 0;  
        this.overlayPose = new Pose();
    }

    createMeshes(): void
    {
        // Drawing the coordinate axes is a good way to check your work.
        // To start, this will just create the axes for the root node of the
        // character, but once you add this to createMeshesRecursive, you 
        // can draw the axes for each bone.  The visibility of the axes
        // is toggled using a checkbox.
        const axes = new gfx.Axes3(0.15);
        this.skeleton.add(axes);

        // Call the recursive method for each root bone
        this.skeleton.rootBones.forEach((rootBone: Bone) => {
            this.createMeshesRecursive(rootBone)
        });
    }

    private createMeshesRecursive(bone: Bone): void
    {
        // TO DO (PART 1): Draw the coordinate axes for the bone
        const axes = new gfx.Axes3(0.15)
        bone.transform.add(axes);


        // TO DO (PART 3): You will want to draw something different for each
        // part of the body. An if statement like this is an easy way
        // to do that.  You can find the names of additional bones in 
        // the .asf files.  Anything that you create will be automatically
        // be made invisible when the coordinate axes are visibile.
        if(bone.name == 'head'){
            const head = new gfx.SphereMesh(1.3* bone.length, .1);
            head.translateY(bone.length/2.2)
            bone.transform.add(head);
        }

        else if(bone.name == 'upperneck'){
            const upperneck = new gfx.SphereMesh(.04, .1)
            upperneck.translateY(bone.length/2);
            bone.transform.add(upperneck);
        }
        else if(bone.name == 'lowerneck'){
            const lowerneck = new gfx.BoxMesh(.04, 2 * bone.length, .04)
            lowerneck.translateY(bone.length/2);
            lowerneck.translateZ(.04)
            bone.transform.add(lowerneck);
        }
        
        else if(bone.name == 'thorax'){
            const thorax = new gfx.BoxMesh(.4, .05, .05)
            bone.transform.add(thorax);
        }
        else if(bone.name == 'upperback'){
            const upperback = new gfx.BoxMesh(.4, .05, .05)
            const spine = new gfx.BoxMesh(.05, .3, .05)
            bone.transform.add(upperback);
            bone.transform.add(spine)
        }
        else if(bone.name == 'lowerback'){
            const lowerback = new gfx.BoxMesh(.4, .05, .05)
            const tailbone = new gfx.BoxMesh(.04, .3, .04)
            tailbone.translateY(-.1)
            bone.transform.add(lowerback);
            bone.transform.add(tailbone)
        }


        else if(bone.name == 'lclavicle'){  
            const lclavicle = new gfx.BoxMesh(bone.length, .05, .05)
            lclavicle.rotateZ(-Math.PI/10)
            lclavicle.translateX(-bone.length/2)
//            lclavicle.translateY(bone.length/2);
            bone.transform.add(lclavicle);
        }
        else if(bone.name == 'rclavicle'){
            const rclavicle = new gfx.BoxMesh(bone.length, .05, .05)
            rclavicle.rotateZ(Math.PI/10)
            rclavicle.translateX(bone.length/2)

            bone.transform.add(rclavicle);
        }
        else if(bone.name == 'lhumerus'){
            const lhumerus = new gfx.BoxMesh(bone.length, .06, .06)
            lhumerus.translateX(-bone.length/2)
            bone.transform.add(lhumerus);
        }
        else if(bone.name == 'rhumerus'){
            const rhumerus = new gfx.BoxMesh(bone.length, .06, .06)
            rhumerus.translateX(bone.length/2)
            bone.transform.add(rhumerus);
        }
        else if(bone.name == 'lradius'){
            const lradius = new gfx.BoxMesh(bone.length*1.5 + .025, .05, .05)
            lradius.translateX(-bone.length/2 + .05)
            bone.transform.add(lradius);
        }
        else if(bone.name == 'rradius'){
            const rradius = new gfx.BoxMesh(bone.length*1.5 +.025, .05, .05)
            rradius.translateX(bone.length/2.6 -.03)
            bone.transform.add(rradius);
        }
        else if(bone.name == 'rhand'){
            const rhand = new gfx.BoxMesh(bone.length*2, .07, .03)
            rhand.translateX(-bone.length/2.6)
            bone.transform.add(rhand);
        }//
        else if(bone.name == 'lhand'){
            const lhand = new gfx.BoxMesh(bone.length*2, .07, .03)
            lhand.translateX(bone.length/2.6)
            bone.transform.add(lhand);
        }

        


        else if(bone.name == 'lhipjoint'){
            const lhipjoint = new gfx.SphereMesh(bone.length, 1)
            lhipjoint.scale.set(1, 1, .5)
            lhipjoint.rotateY(-Math.PI/3.8)
            lhipjoint.translateX(bone.length/3);
            bone.transform.add(lhipjoint);
        }
        else if(bone.name == 'rhipjoint'){
            const rhipjoint = new gfx.SphereMesh(bone.length, 1)
            rhipjoint.scale.set(1, 1, .5)
            rhipjoint.rotateY(Math.PI/3.8)
            rhipjoint.translateX(- bone.length/3);
            bone.transform.add(rhipjoint);
        }

        else if(bone.name == 'lfemur'){
            const lfemur = new gfx.BoxMesh(.08, bone.length, .08)
            lfemur.rotateZ(.2)
            lfemur.translateY(bone.length/2);
            bone.transform.add(lfemur);
        }
        else if(bone.name == 'rfemur'){
            const rfemur = new gfx.BoxMesh(.08, bone.length, .08)
            rfemur.translateY(bone.length/2);
            rfemur.rotateZ(-.2)
            bone.transform.add(rfemur);
        }

        else if(bone.name == 'rtibia'){
            const rtibia = new gfx.BoxMesh(.06, bone.length, .06)
            rtibia.translateX(.1)
            rtibia.translateY(bone.length/2);
            bone.transform.add(rtibia);
        }
        else if(bone.name == 'ltibia'){
            const ltibia = new gfx.BoxMesh(.06, bone.length, .06)
            ltibia.translateX(-.1)
            ltibia.translateY(bone.length/2);
            bone.transform.add(ltibia);
        }
        else if(bone.name == 'lfoot'){
            const lfoot = new gfx.BoxMesh(.06, .06, bone.length)
            lfoot.translateX(-.1)
            lfoot.translateY(bone.length-.04);
            lfoot.translateZ(-.02)
            bone.transform.add(lfoot);
        }
        else if(bone.name == 'rfoot'){
            const rfoot = new gfx.BoxMesh(.06, .06, bone.length)
            rfoot.translateX(.1)
            rfoot.translateY(bone.length-.04);
            rfoot.translateZ(-.02)
            bone.transform.add(rfoot);
        }

        // TO DO (PART 1): Recursively call this function for each of the bone's children
        bone.children.forEach((subBone: Bone) => {
            this.createMeshesRecursive(subBone);
        });
    }

    loadSkeleton(filename: string): void
    {
        this.skeleton.loadFromASF(filename);
    }

    loadMotionClip(filename: string): MotionClip
    {
        const clip = new MotionClip();
        clip.loadFromAMC(filename, this.skeleton);
        return clip;
    }

    play(clip: MotionClip): void
    {
        this.stop();
        this.clip = clip;
        this.currentPose = this.clip.frames[0];
    }

    stop(): void
    {
        this.clip = null;
        this.currentTime = 0;

        this.overlayQueue = [];
        this.overlayTransitionFrames = [];
        this.overlayTime = 0;
    }

    overlay(clip: MotionClip, transitionFrames: number): void
    {
        this.overlayQueue.push(clip);
        this.overlayTransitionFrames.push(transitionFrames);
    }

    update(deltaTime: number): void
    {
        // If the motion queue is empty, then do nothing
        if(!this.clip)
            return;

        // Advance the time
        this.currentTime += deltaTime;

        // Set the next frame number
        let currentFrame = Math.floor(this.currentTime * this.fps);

        if(currentFrame >= this.clip.frames.length)
        {
            currentFrame = 0;
            this.currentTime = 0;   
            this.currentPose = this.clip.frames[0];
        }

        let overlayFrame = 0;

        // Advance the overlay clip if there is one
        if(this.overlayQueue.length > 0)
        {
            this.overlayTime += deltaTime;

            overlayFrame = Math.floor(this.overlayTime * this.fps);

            if(overlayFrame >= this.overlayQueue[0].frames.length)
            {
                this.overlayQueue.shift();
                this.overlayTransitionFrames.shift();
                this.overlayTime = 0;
                overlayFrame = 0;
            }
        }

        const pose = this.computePose(currentFrame, overlayFrame);
        this.skeleton.update(pose, this.useAbsolutePosition);
    }

    public getQueueCount(): number
    {
        return this.overlayQueue.length;
    }

    private computePose(currentFrame: number, overlayFrame: number): Pose
    {
        // If there is an active overlay track
        if(this.overlayQueue.length > 0)
        {
            // Start out with the unmodified overlay pose
            const overlayPose = this.overlayQueue[0].frames[overlayFrame].clone();

            let alpha = 0;

            // Fade in the overlay
            if(overlayFrame < this.overlayTransitionFrames[0])
            {
                alpha = 1 - overlayFrame / this.overlayTransitionFrames[0];
                overlayPose.lerp(this.clip!.frames[currentFrame], alpha);
            }
            // Fade out the overlay
            else if (overlayFrame > this.overlayQueue[0].frames.length - this.overlayTransitionFrames[0])
            {
                alpha = 1 - (this.overlayQueue[0].frames.length - overlayFrame) / this.overlayTransitionFrames[0];
                overlayPose.lerp(this.clip!.frames[currentFrame], alpha);
            }

            if(!this.useAbsolutePosition)
            {
                const relativeOverlayPosition = gfx.Vector3.copy(this.overlayQueue[0].frames[overlayFrame].rootPosition);
                relativeOverlayPosition.subtract(this.overlayPose.rootPosition);

                const relativePosition = gfx.Vector3.copy(this.clip!.frames[currentFrame].rootPosition);
                relativePosition.subtract(this.currentPose.rootPosition);

                relativeOverlayPosition.lerp(relativeOverlayPosition, relativePosition, alpha);
                this.position.add(relativeOverlayPosition);

                this.overlayPose = this.overlayQueue[0].frames[overlayFrame];
                this.currentPose = this.clip!.frames[currentFrame];
            }
            
            return overlayPose;
        }
        // Motion is entirely from the base track
        else
        {
            if(!this.useAbsolutePosition)
            {
                const relativePosition = gfx.Vector3.copy(this.clip!.frames[currentFrame].rootPosition);
                relativePosition.subtract(this.currentPose.rootPosition);
                this.position.add(relativePosition);
                this.currentPose = this.clip!.frames[currentFrame];
            }

            return this.clip!.frames[currentFrame];
        }
    }

    // Entry function for the recursive call
    toggleAxes(showAxes: boolean): void
    {
        this.toggleAxesRecursive(this.skeleton, showAxes);
    }

    private toggleAxesRecursive(object: gfx.Transform3, showAxes: boolean): void
    {
        // Set the visibility of the coordinate axes
        if(object instanceof gfx.Axes3)
        {
            object.material.visible = showAxes;
        }
        // Set the visibility of all materials that are not coordinate axes
        else if(object instanceof gfx.Mesh || object instanceof gfx.MeshInstance || object instanceof gfx.Line3)
        {
            object.material.visible = !showAxes;
        }

        // Call the function recursively for each child node
        object.children.forEach((child: gfx.Transform3) => {
            this.toggleAxesRecursive(child, showAxes);
        });
    }
}