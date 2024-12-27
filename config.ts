/**
 * Each module to have a config file used for enhancing integration with system modules
 */
export default {
    /**
     * used for extending system modules
     * the config item points to the source and property hosing the user profile data that gets extended
     * the field should be json field
     * the name of json fields must start with the name source model eg "coopMember"
     * coops module use this to:
     *  - set active coop to the user. This is useful when one is a member of more than one coop
     */
    extension: [
        {
            origin: {
                ctx: "Sys",
                m: "User",
                c: "UserProfile",
                a: "getUserProfileI"
            },
            extension: {
                ctx: "App",
                m: "Coops",
                c: "CoopMember",
                a: "getCoopMemberProfileI"
            }
        },
        {
            origin: {
                ctx: "Sys",
                m: "User",
                c: "UserProfile",
                a: "setUserProfile"
            },
            extension: {
                ctx: "App",
                m: "Coops",
                c: "CoopMember",
                a: "setCoopMemberProfile"
            }
        }
    ]
}

