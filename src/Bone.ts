/* Assignment 4: So You Think Ants Can Dance
 * CSCI 4611, Fall 2022, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'
import { Pose } from "./Pose";

export class Bone
{
    public name: string;
    public direction: gfx.Vector3;
    public length: number;
    public dofs: boolean[];
    public children: Bone[];

    public boneToRotationSpace: gfx.Quaternion;
    public rotationToBoneSpace: gfx.Quaternion;

    public transform: gfx.Transform3;

    constructor()
    {
        this.name = '';
        this.direction = new gfx.Vector3();
        this.length = 0;
        this.dofs = [false, false, false];
        this.children = [];

        this.boneToRotationSpace = new gfx.Quaternion();
        this.rotationToBoneSpace = new gfx.Quaternion();

        this.transform = new gfx.Transform3();    
    }

    createHierarchy(parentTransform: gfx.Transform3): void
    {
        this.resetTransform();
        parentTransform.add(this.transform);

        this.children.forEach((child: Bone) => {
            child.createHierarchy(this.transform);
        });
    }

    private resetTransform(): void
    {
        this.transform.position.copy(this.direction);
        this.transform.position.multiplyScalar(this.length);
        this.transform.rotation.setIdentity();
    }

    update(pose: Pose): void
    {
        this.resetTransform();

        /** TO DO (PART 2): You will first need to compute the transform.position in the correct 
         * coordinate space. Think of the vertices that make up the geometry of each bone as being 
         * defined in "bone space", where the joint that the bone rotates around is located at the 
         * origin, and the bone extends in the direction and length specified by the skeleton. 
         * 
         * The transform.position of each bone is determined by the direction and length defined
         * by the skeleton.  At the beginning of the update() loop, the transform.position is reset
         * to this location in bone space.  This means that the transform.position first needs to
         * be rotated to be in "rotation axis space" because the rotation axes are not guaranteed 
         * to line up perfectly with the bone's X,Y,Z axes. The bone's rotation axes are a property 
         * of the skeleton -- they are set for each skeleton and do not change for each pose. You 
         * can access the quaternionx that transform from "bone space" to "rotation axis space" as 
         * member variables.
         */
        this.transform.position.rotate(this.boneToRotationSpace);
           
         /* Second, now that the transform.position is in the bone's "rotation axis space", the 
         * rotation from the character's current pose can be applied.  The current pose can be 
         * accessed using the pose.getJointRotation() method.
         */
        this.transform.position.rotate(pose.getJointRotation(this.name));
         
         /* Third, after the transform.position has been transformed according to the appropriate 
         * rotation axes, it must now be rotated back into regular "bone space."  At this point, 
         * the position should be properly rotated based upon the current pose.
         */
        this.transform.position.rotate(this.rotationToBoneSpace);
         
         /* As a next step, you should call the update() method for each of the bone's children to
         * recursively propagate through the entire skeleton.  If you run the code and check the
         * box to show the coordinate axes, you should see some figures that appear to be dancing.
         * However, the rotation of the bones is still not correct!
         */
        this.children.forEach((subBone: Bone) => {
            subBone.update(pose);
        });
        

         /* To finish this method, you will need to also compute the bone's transform.rotation in
         * the correct coordinate space.  This is similar to the steps describe above for the 
         * position, except that you will need to compose all three rotations together using 
         * quaternion multiplication.  Note that due to the way quaternion math works, you may 
         * need to apply these multiplications in reverse order from what you might expect.
         */ 
        this.transform.rotation.multiply(this.rotationToBoneSpace);

        this.transform.rotation.multiply(pose.getJointRotation(this.name));

        this.transform.rotation.multiply(this.boneToRotationSpace);
         
         /* Finally, you will need to call the update() method for each of the bone's children to
         * propagate through the entire skeleton.
         */
        this.children.forEach((subBone: Bone) => {
            subBone.update(pose);
        });
         
         /* After all these steps are completed, the coordinate axes should appear to form
         * skeletons that are dancing the salsa!  If all the transformations are correct, then 
         * the axes that represent the hands of the two dancers should line up properly when
         * the couple is dancing together.
         */
    }
}