/* Assignment 4: So You Think Ants Can Dance
 * CSCI 4611, Fall 2022, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'

export class Pose
{
    public frame: number;
    public rootPosition: gfx.Vector3;
    public rootRotation: gfx.Quaternion;

    private jointRotations: Map<string, gfx.Quaternion>;

    constructor()
    {
        this.frame = 0;
        this.rootPosition = new gfx.Vector3();
        this.rootRotation = new gfx.Quaternion();

        this.jointRotations = new Map();
    }

    public getJointRotation(boneName: string): gfx.Quaternion
    {
        const jointRotation = this.jointRotations.get(boneName);

        if(jointRotation)
            return jointRotation;
        else
            return new gfx.Quaternion();
    }

    public setJointRotation(boneName: string, rotation: gfx.Quaternion): void
    {
        this.jointRotations.set(boneName, rotation);
    }

    public lerp(pose: Pose, alpha: number): void
    {
        this.frame = Math.round(gfx.MathUtils.lerp(this.frame, pose.frame, alpha));
        this.rootPosition.lerp(this.rootPosition, pose.rootPosition, alpha);
        this.rootRotation.slerp(this.rootRotation, pose.rootRotation, alpha);

        this.jointRotations.forEach((value: gfx.Quaternion, key: string) => {
            value.slerp(value, pose.getJointRotation(key), alpha);
        });
    }

    public clone(): Pose
    {
        const pose = new Pose();
        pose.frame = this.frame;
        pose.rootRotation.copy(this.rootRotation);
        pose.rootPosition.copy(this.rootPosition);
        
        this.jointRotations.forEach((value: gfx.Quaternion, key: string) => {
            pose.setJointRotation(key, value.clone());
        });

        return pose;
    }
}