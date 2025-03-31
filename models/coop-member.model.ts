import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
    validateOrReject,
} from 'class-validator';
import { IUserProfile, userProfileDefault } from '../../../sys/user/models/user.model';
import { IAclRole } from '../../../sys/base/IBase';
import { CoopMemberViewModel } from './coop-member-view.model';

// `coop_member`.`coop_member_id`,
// `coop_member`.`coop_member_guid`,
// `coop_member`.`coop_member_type_id`,
// `coop_member`.`user_id`,
// `coop_member`.`doc_id`,
// `coop_member`.`coop_member_enabled`,
// `coop_member`.`coop_id`



@Entity(
    {
        name: 'coop_member',
        synchronize: false
    }
)
// @CdModel
export class CoopMemberModel {

    @PrimaryGeneratedColumn(
        {
            name: 'coop_member_id'
        }
    )
    coopMemberId?: number;

    @Column({
        name: 'coop_member_guid',
        length: 40,
        default: uuidv4()
    })
    coopMemberGuid?: string;

    @Column(
        {
            name: 'coop_member_type_id',
            nullable: true
        }
    )
    coopMemberTypeId: number;

    @Column(
        {
            name: 'user_id',
            nullable: true
        }
    )
    userId: number;

    @Column(
        {
            name: 'doc_id',
            nullable: true
        }
    )
    docId?: number;

    @Column(
        {
            name: 'coop_member_enabled',
            nullable: true
        }
    )
    coopMemberEnabled: boolean;

    @Column(
        {
            name: 'coop_id',
            nullable: true
        }
    )
    coopId: number;

    // coop_member_approved
    @Column(
        {
            name: 'coop_member_approved',
            nullable: true
        }
    )
    coopMemberApproved?: string;

    @Column(
        {
            name: 'coop_active',
            nullable: true
        }
    )
    coopActive: boolean;

    @Column(
        {
            name: 'coop_member_profile',
            nullable: true
        }
    )
    coopMemberProfile: string;

}

export interface IMemberProfileAccess {
    userPermissions: IProfileMemberAccess[],
    groupPermissions: IProfileGroupAccess[]
}

/**
 * Improved versin should have just one interface and 
 * instead of userId or groupId, cdObjId is applied.
 * This would then allow any object permissions to be set
 * Automation and 'role' concept can then be used to manage permission process
 */
export interface IProfileMemberAccess {
    userId: number,
    hidden: boolean,
    field: string,
    read: boolean,
    write: boolean,
    execute: boolean
}

export interface IProfileGroupAccess {
    groupId: number,
    field: string,
    hidden: boolean,
    read: boolean,
    write: boolean,
    execute: boolean
}

// export interface ICoopMemberProfile {
//     userProfile: IUserProfile;
//     // coopMemberFieldPermissions: IMemberProfileAccess; // accessibility of personal data
//     coopMembership: { 
//         memberData: CoopMemberViewModel[];
//         acl: MemberMeta[]; // affilication with various SACCOS(privilage related data in various SACCOS)
//     }
// }

export interface ICoopMemberProfile extends IUserProfile {
    coopMembership: { 
        memberData: CoopMemberViewModel[];
        acl: MemberMeta[]; // affiliation with various SACCOS (privilege-related data in various SACCOS)
    };
}

export interface MemberMeta {
    coopId: number|null,
    coopActive: boolean,
    coopRole: ICoopRole;
    aclRole?: IAclRole
    coopMemberData?: CoopMemberViewModel[]; // affilication with various SACCOS(selection of coop_member_view where the current user appears)
}

// Define a type that excludes 'coopMembership' from ICoopMemberProfile
export type IUserProfileOnly = Omit<ICoopMemberProfile, 'coopMembership'>;

/**
 * Note that coop membership prrofile is an extension of user profile
 * Note that the first item is userProfile and by default has a value imported from userProfileDefault,
 * On load, date will be set from database.
 * the data below is just a default,
 * details are be managed with 'roles' features
 * 
 */

export const coopMemberProfileDefault: ICoopMemberProfile = {
    ...userProfileDefault,  // Copy all properties from userProfileDefault
    coopMembership:
    {
        memberData: [
            {
                userName: "",
                fName: "",
                lName: "",
            }
        ],
        acl: [
            {
                coopId: -1,
                coopActive: false,
                coopRole: [
                    { scope: CoopsAclScope.COOPS_GUEST, geoLocationId: null },
                ],
                /**
                 * specified permission setting for given members to specified fields
                 */
                aclRole: {
                    aclRoleName: "guest",
                    permissions: {
                        userPermissions: [
                            {
                                cdObjId: 0,
                                hidden: true,
                                field: "",
                                read: false,
                                write: false,
                                execute: false
                            }
                        ],
                        groupPermissions: [
                            {
                                cdObjId: 0,
                                hidden: true,
                                field: "",
                                read: false,
                                write: false,
                                execute: false
                            }

                        ]
                    }
                }
            }
        ]
    }
}

/**
 * Example usage
 * const role: CoopsRoles = CoopsRoles.COOPS_GUEST;
 * console.log(role); // Output: 11
 */

// Enum for ACL Scope
export const enum CoopsAclScope {
    COOPS_GUEST = 11,
    COOPS_USER = 12,
    COOPS_MEMBER = 13,
    COOPS_SACCO_ADMIN = 14,
    COOPS_REGIONAL_ADMIN = 15,
    COOPS_NATIONAL_ADMIN = 16,
    COOPS_CONTINENTAL_ADMIN = 17,
    COOPS_GLOBAL_ADMIN = 18
}

// Interface for ICoopAcl
export interface ICoopAcl {
    scope: CoopsAclScope;
    geoLocationId: number | null;
}


/**
 * Interface for CoopScope, which is an array of CoopAcl
 * Usage:
 * const coopScope: CoopScope = [
  { scope: CoopsAclScope.COOPS_GUEST, geoLocationId: null },
  { scope: CoopsAclScope.COOPS_SACCO_ADMIN, geoLocationId: 123 },
  { scope: CoopsAclScope.COOPS_GLOBAL_ADMIN, geoLocationId: 456 }
];

console.log(coopScope);
 */
export interface ICoopRole extends Array<ICoopAcl> { }


