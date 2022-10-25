/* Assignment 4: So You Think Ants Can Dance
 * CSCI 4611, Fall 2022, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'
import { Bone } from './Bone'
import { Pose } from './Pose'

export class Skeleton extends gfx.Transform3
{
    private static numLoading = 0;

    public static finishedLoading(): boolean
    {
        return Skeleton.numLoading == 0;
    }

    private usingDegrees: boolean;
    private bones: Map<string, Bone>;
    
    public loaded: boolean;
    public rootPosition: gfx.Vector3;
    public rootRotation: gfx.Quaternion;
    public rootBones: Bone[];

    constructor()
    {
        super();
        
        this.loaded = false;
        this.usingDegrees = false;
        this.bones = new Map();

        this.rootPosition = new gfx.Vector3();
        this.rootRotation = new gfx.Quaternion();

        this.rootBones = [];
    }

    loadFromASF(filename: string): void
    {
        console.log('Loading skeleton data from ' + filename + '...');

        Skeleton.numLoading++;

        gfx.TextFileLoader.load(filename, (loadedFile: gfx.TextFile) => {
            
            const parser = new gfx.StringParser(loadedFile.data);

            while(!parser.done())
            {
                const nextToken = parser.readToken();
                if (nextToken.charAt(0) == '#')
                    parser.consumeLine();
                else if(nextToken == ':units')
                    this.parseUnits(parser);
                else if(nextToken == ':root')
                    this.parseRoot(parser);
                else if(nextToken == ':bonedata')
                    this.parseBoneData(parser);
                else if(nextToken == ':hierarchy')
                    this.parseHierarchy(parser);
                else if(nextToken == ':version')
                    parser.consumeLine();
                else if(nextToken == ':name')
                    parser.consumeLine();
                else if(nextToken == ':documentation')
                {
                    while(!parser.done() && !(parser.peek().charAt(0) == ':'))
                        parser.consumeLine();
                }
                else
                {
                    console.error("Error: encountered unknown token: " + nextToken)
                    return;
                }
            }

            console.log('Skeleton data loaded from ' + filename + '.');
            Skeleton.numLoading--;

            this.createHierarchy();
        });
    }

    private parseUnits(parser: gfx.StringParser): void
    {
        let done: boolean;
        do
        {
            done = true;
            if(parser.expect('mass') || parser.expect('length'))
            {
                done = false;
                parser.consumeLine();
            }
            else if(parser.expect('angle'))
            {
                done = false;
                this.usingDegrees = parser.readToken() == 'deg';
            }
        } while(!done);

    }

    private parseRoot(parser: gfx.StringParser): void
    {
        let done: boolean;
        do
        {
            done = true;
            if(parser.expect('order'))
            {
                done = false;
                if( !parser.expect('TX') || !parser.expect('TY') || !parser.expect('TZ') ||
                    !parser.expect('RX') || !parser.expect('RY') || !parser.expect('RZ'))
                {
                    console.error('Error: order not in the order expected');
                    return;
                }
            }
            else if(parser.expect('axis'))
            {
                done = false;
                if(!parser.expect('XYZ'))
                {
                    console.error('Error: axis not in the order expected');
                    return;
                }
            }
            else if(parser.expect('position'))
            {
                done = false;
                this.rootPosition.set(parser.readNumber(), parser.readNumber(), parser.readNumber());

                // Convert from AMC mocap units to meters
                this.rootPosition.multiplyScalar(0.056444);
            }
            else if(parser.expect('orientation'))
            {
                done = false;

                const angles = new gfx.Vector3(parser.readNumber(), parser.readNumber(), parser.readNumber());
                if(this.usingDegrees)
                    angles.multiplyScalar(Math.PI / 180);

                // AMC mocap data uses ZYX transformation order for Euler angles
                this.rootRotation = gfx.Quaternion.makeEulerAngles(angles.x, angles.y, angles.z, 'ZYX');
            }
        } while(!done);
    }

    private parseBoneData(parser: gfx.StringParser): void
    {
        while(parser.expect('begin'))
        {
            const bone = new Bone();
            while(!parser.expect('end'))
            {
                if(parser.expect('id'))
                {
                    // not using, discard
                    parser.consumeLine();
                }
                else if(parser.expect('name'))
                {
                    const name = parser.readToken();
                    bone.name = name;
                    this.bones.set(name, bone);
                }
                else if(parser.expect('direction'))
                {
                    bone.direction.x = parser.readNumber();
                    bone.direction.y = parser.readNumber();
                    bone.direction.z = parser.readNumber();
                }
                else if(parser.expect('length'))
                {
                    // Convert from AMC mocap units to meters
                    bone.length = parser.readNumber() * 0.056444;
                }
                else if(parser.expect('axis'))
                {
                    const angles = new gfx.Vector3(parser.readNumber(), parser.readNumber(), parser.readNumber());
                    if(this.usingDegrees)
                        angles.multiplyScalar(Math.PI / 180);

                    if(parser.expect('XYZ'))
                    {
                        // AMC mocap data uses ZYX transformation order for Euler angles
                        bone.rotationToBoneSpace = gfx.Quaternion.makeEulerAngles(angles.x, angles.y, angles.z, 'ZYX');
                        bone.boneToRotationSpace.copy(bone.rotationToBoneSpace);
                        bone.boneToRotationSpace.invert();
                    }
                    else
                    {
                        console.error('Error: bone axis not in the order expected');
                        return;
                    }
                }
                else if(parser.expect('dof'))
                {
                    bone.dofs[0] = parser.expect('rx');
                    bone.dofs[1] = parser.expect('ry');
                    bone.dofs[2] = parser.expect('rz');
                }
                else if(parser.expect('limits'))
                {
                    if(bone.dofs[0])
                    {
                        // not using, discard
                        parser.consumeLine();  
                    }

                    if(bone.dofs[1])
                    {
                        // not using, discard
                        parser.consumeLine();  
                    }

                    if(bone.dofs[2])
                    {
                        // not using, discard
                        parser.consumeLine();  
                    }
                }
            }
        }
    }

    private parseHierarchy(parser: gfx.StringParser): void
    {
        if(parser.expect('begin'))
        {
            while(!parser.expect('end'))
            {
                const parent = parser.readToken();
                const children = parser.readLine();

                children.forEach((child: string) => {
                    if(parent == 'root')
                    {
                        const bone = this.bones.get(child)!;
                        this.rootBones.push(bone);
                    }
                    else
                    {
                        const bone = this.bones.get(child)!;
                        const parentBone = this.bones.get(parent)!;
                        parentBone.children.push(bone);
                    }
                });
            }
        }
        else
        {
            console.error('Error: reading hierarchy, expected begin, found ' + parser.peek());
        }
    }

    public getBone(bone: string): Bone
    {
        return this.bones.get(bone)!;
    }

    public createHierarchy(): void
    {
        this.rootBones.forEach((bone: Bone) => {
            bone.createHierarchy(this);
        });
    }

    public update(pose: Pose, useAbsolutePosition: boolean): void
    {
        // Reset the skeleton to its base rotation
        this.rotation.copy(this.rootRotation)

        // Apply the root rotation for this pose
        this.rotation.multiply(pose.rootRotation);

        // Only apply the translation if we are using absolute positions
        if(useAbsolutePosition)
        {
            this.position.copy(this.rootPosition);
            this.position.add(pose.rootPosition);
        }

        // Update the pose of each bone in the skeleton
        this.rootBones.forEach((bone: Bone) => {
              bone.update(pose);
        });
    }
}