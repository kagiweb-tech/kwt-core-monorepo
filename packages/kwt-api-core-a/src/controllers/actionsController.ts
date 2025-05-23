import accountModel, { IWorkspace, IAccountAccountRef } from '../dataSource/models/accountModel'
import { IRole } from '../dataSource/models/roleModel'
import accountController from './accountController'
import DataCleaner from '../utilities/dataCleaner'

export interface IAccountActionInfo {
    _id: string,
    actionType: string,
    fromAccount: {
        _id: string,
        nameId: string
    },
    toAccount: {
        _id: string,
        nameId: string
    },
    workspace?: {
      _id: string,
      name: string
    },
    ref: {
      _id: string,
      accepted: boolean,
      declined: boolean,
      disabled: boolean,
      createdAt: Date,
      updatedAt: Date
    },
    refRole: {
      _id: string,
      name: string
    }
}

class ActionsController {
    // accounts/:accountId/actions/:actionType/module/:moduleType/:moduleId/ref/:refType/:refId
    public async getAccountActionInfo(accountId:string, actionType:string, moduleType:string, moduleId:string, refType:string, refId:string):Promise<IAccountActionInfo|undefined> {
      let actionInfo:IAccountActionInfo|undefined = undefined
      
      // invitations
        if (actionType === 'invitation') {
            // if moduleType is account get account invitation
            if (moduleType === 'account' && refType === 'accountRef') {
                // get account where the account is referenced: username, id
                // get the the account reference data
                // get the account reference role

                // console.log(
                // `
                // getAccountActionInfo:
                //     accountId: ${accountId},
                //     actionType: ${actionType}, 
                //     moduleType: ${moduleType},
                //     moduleId: ${moduleId}, 
                //     refType: ${refType},
                //     refId: ${refId}
                // `)

                const actionInfoResp:IAccountActionInfo[] = await accountModel.aggregate<IAccountActionInfo>([
                  {
                    $match: {
                      _id: moduleId,
                      "accountRefs._id": refId,
                      "accountRefs.accountId": accountId
                    }
                  },
                  {
                    $unwind: {
                      path: "$accountRefs",
                      preserveNullAndEmptyArrays: false
                    }
                  },
                  {
                    $match: {
                      "accountRefs._id": refId,
                      "accountRefs.accountId": accountId
                    }
                  },
                  {
                    $unwind: {
                      path: "$accountRefs.accountConfigs",
                      preserveNullAndEmptyArrays: false
                    }
                  },
                  {
                    $match: {
                      "accountRefs.accountConfigs.key":
                        "default-role"
                    }
                  },
                  {
                    $lookup: {
                      from: "roles",
                      localField:
                        "accountRefs.accountConfigs.value",
                      foreignField: "_id",
                      as: "accountAccountRole"
                    }
                  },
                  {
                    $unwind: {
                      path: "$accountAccountRole",
                      preserveNullAndEmptyArrays: false
                    }
                  },
                  {
                    $lookup: {
                      from: "accounts",
                      localField: "accountRefs.accountId",
                      foreignField: "_id",
                      as: "fromAccount"
                    }
                  },
                  {
                    $unwind: {
                      path: "$fromAccount",
                      preserveNullAndEmptyArrays: false
                    }
                  },
                  {
                    $project: {
                      "toAccount._id": "$_id",
                      "toAccount.nameId": "$nameId",
                      "fromAccount._id": "$fromAccount._id",
                      "fromAccount.nameId": "$fromAccount.nameId",
                      "ref._id": "$accountRefs._id",
                      "ref.accepted": "$accountRefs.accepted",
                      "ref.declined": "$accountRefs.declined",
                      "ref.disabled": "$accountRefs.disabled",
                      "ref.createdAt": "$accountRefs.createdAt",
                      "ref.updatedAt": "$accountRefs.updatedAt",
                      "refRole._id": "$accountAccountRole._id",
                      "refRole.name": "$accountAccountRole.name"
                    }
                  }
                ])

                actionInfo = actionInfoResp.length? actionInfoResp[0]: undefined
                // console.log(`actionInfo result: `, actionInfo) 
            }
        }

        if (actionInfo) {
          actionInfo.actionType = actionType
        }

        return actionInfo
    }

    // accounts/:accountId/actions/:actionType/module/:moduleType/:moduleId/subModule/:subModuleType/:subModuleId/ref/:refType/:refId
    public async getAccountWorkspaceActionInfo(accountId:string, actionType:string, moduleType:string, moduleId:string, subModuleType:string, subModuleId:string, refType:string, refId:string):Promise<IAccountActionInfo|undefined> {
      let actionInfo:IAccountActionInfo|undefined = undefined
      
      // invitations
         if (actionType === 'invitation') {
          // if moduleType is account get account invitation
          if (moduleType === 'account' && subModuleType === 'workspace' && refType === 'accountRef') {
              // get account where the account is referenced: username, id
              // get workspace where the workspace
              // get the the account reference data
              // get the account reference role

              // console.log(`
              // controller:
              //   accountId: ${accountId},
              //   actionType: ${actionType},
              //   moduleType: ${moduleType},
              //   moduleId: ${moduleId},
              //   subModuleType: ${subModuleType},
              //   subModuleId: ${subModuleId},
              //   refType: ${refType},
              //   refId: ${refId}
              // `)

              const actionInfoResp:IAccountActionInfo[] = await accountModel.aggregate<IAccountActionInfo>([
                {
                  $match: {
                    _id: moduleId,
                    "workspaces._id": subModuleId,
                    "workspaces.accountRefs._id": refId,
                    "workspaces.accountRefs.accountId": accountId
                  }
                },
                {
                  $unwind: {
                      path: "$workspaces",
                      preserveNullAndEmptyArrays: false
                    }
                },
                {
                  $match: {
                      "workspaces._id": subModuleId,
                      "workspaces.accountRefs._id": refId,
                      "workspaces.accountRefs.accountId": accountId
                    }
                },
                {
                  $unwind: {
                      path: "$workspaces.accountRefs",
                      preserveNullAndEmptyArrays: false
                    }
                },
                {
                  $match: {
                      "workspaces.accountRefs._id": refId,
                      "workspaces.accountRefs.accountId": accountId
                    }
                },
                {
                  $unwind: {
                    path: "$workspaces.accountRefs.accountConfigs",
                    preserveNullAndEmptyArrays: false
                  }
                },
                {
                  $match: {
                    "workspaces.accountRefs.accountConfigs.key": "default-role"
                  }
                },
                {
                  $lookup: {
                    from: "roles",
                    localField: "workspaces.accountRefs.accountConfigs.value",
                    foreignField: "_id",
                    as: "accountWorkspaceRole"
                  }
                },
                {
                  $unwind: {
                    path: "$accountWorkspaceRole",
                    preserveNullAndEmptyArrays: false
                  }
                },
                {
                  $lookup: {
                    from: "accounts",
                    localField: "workspaces.accountRefs.accountId",
                    foreignField: "_id",
                    as: "fromAccount"
                  }
                },
                {
                  $unwind: {
                    path: "$fromAccount",
                    preserveNullAndEmptyArrays: false
                  }
                },
                {
                  $project: {
                    "toAccount._id": "$_id",
                    "toAccount.nameId": "$nameId",
                    "fromAccount._id": "$fromAccount._id",
                    "fromAccount.nameId": "$fromAccount.nameId",
                    "workspace._id": "$workspaces._id",
                    "workspace.name": "$workspaces.name",
                    "ref._id": "$workspaces.accountRefs._id",
                    "ref.accepted": "$workspaces.accountRefs.accepted",
                    "ref.declined": "$workspaces.accountRefs.declined",
                    "ref.disabled": "$workspaces.accountRefs.disabled",
                    "ref.createdAt": "$workspaces.accountRefs.createdAt",
                    "ref.updatedAt": "$workspaces.accountRefs.updatedAt",
                    "refRole._id": "$accountWorkspaceRole._id",
                    "refRole.name": "$accountWorkspaceRole.name"
                  }
                }
              ])

              actionInfo = actionInfoResp.length? actionInfoResp[0]: undefined
          }
      }

      if (actionInfo) {
        actionInfo.actionType = actionType
      }

      return actionInfo
    }

    public async acceptOrDeclineAccountAction(accountId:string, actionType:string, moduleType:string, moduleId:string, refType:string, refId:string, accept:boolean):Promise<boolean> {
        // invitations
        if (actionType === 'invitation') {
          // if moduleType is account get account invitation
          if (moduleType === 'account' && refType === 'accountRef') {
            let acc = await accountModel.findOne({_id: moduleId})
            if (!acc) throw({code: 404, message: 'Module not found.'})

            let accountRef = acc.accountRefs?.id(refId)
            if (!accountRef) throw({code: 404, message: 'Account reference not found.'})
            if (accountRef?.accountId !== accountId) throw({code: 404, message: 'Account reference not found.'})

            if (DataCleaner.getBooleanData(accept).isValid) {
                if (DataCleaner.getBooleanData(accept).data) {
                  acc.accountRefs!.id(refId)!.accepted = true
                  acc.accountRefs!.id(refId)!.declined = false
                } else {
                  acc.accountRefs!.id(refId)!.accepted = false
                  acc.accountRefs!.id(refId)!.declined = true
                }

                await acc.save()
                await accountController.cachedData.removeCacheData(moduleId)
            }
          }
        }
        return true
    }

    public async acceptOrDeclineAccountWorkspaceAction(accountId:string, actionType:string, moduleType:string, moduleId:string, subModuleType:string, subModuleId:string, refType:string, refId:string, accept:boolean):Promise<boolean> {

      // invitations
      if (actionType === 'invitation') {
        // if moduleType is account get account invitation
        if (moduleType === 'account' && subModuleType === 'workspace' && refType === 'accountRef') {
          let acc = await accountModel.findOne({_id: moduleId})
          if (!acc) throw({code: 404, message: 'Module not found.'})

          // check account workspace
          let workspace = acc.workspaces?.id(subModuleId)
          if (!workspace) throw({code: 404, message: 'Workspace not found.'})

          // check account refs
          let accountRef = acc.workspaces?.id(subModuleId)?.accountRefs?.id(refId)
          if (!accountRef) throw({code: 404, message: 'Account reference not found.'})
          if (accountRef?.accountId !== accountId) throw({code: 404, message: 'Account reference not found.'})

          if (DataCleaner.getBooleanData(accept).isValid) {
              if (DataCleaner.getBooleanData(accept).data) {
                acc.workspaces!.id(subModuleId)!.accountRefs!.id(refId)!.accepted = true
                acc.workspaces!.id(subModuleId)!.accountRefs!.id(refId)!.declined = false
              } else {
                acc.workspaces!.id(subModuleId)!.accountRefs!.id(refId)!.accepted = false
                acc.workspaces!.id(subModuleId)!.accountRefs!.id(refId)!.declined = true
              }

              await acc.save()
              await accountController.cachedData.removeCacheData(moduleId)
          }
        }
      }
        return true
    }
}

export default new ActionsController()