import express, { Request, Response } from 'express'

// import accountModel, { IAccount } from '../dataSource/models/accountModel'
import ErrorHandler from '../utilities/errorHandler'
import Config from '../utilities/config'
import routerIdentity from '../utilities/routerIdentity'
// import DataRequest, {IListOutput}  from '../utilities/dataQuery'

import accountController, {IAccessInfo  } from '../controllers/accountController'
import accountRoleController from '../controllers/accountRoleController'
import accountAccountInfoController from '../controllers/accountAccountInfoController'
import accountAccountConfigController from '../controllers/accountAccountConfigController'
import accountContactInfoController from '../controllers/accountContactInfoController'
import accountPasswordController from '../controllers/accountPasswordController'
import accountLimitedTransactionController from '../controllers/accountLimitedTransactionController'
import accountClientDeviceController from '../controllers/accountClientDeviceController'
import accountClientDeviceAccessTokenController from '../controllers/accountClientDeviceAccessTokenController'
import accountAccountRefController from '../controllers/accountAccountRefController'
import accountAccountRefAccountConfigController from '../controllers/accountAccountRefAcountConfigController'
import accountAccountRefRoleController from '../controllers/accountAccountRefRoleController'
import accountWorkspaceController from '../controllers/accountWorkspaceController'
import accountWorkspaceAccountRefController from '../controllers/accountWorkspaceAccountRefController'
import accountWorkspaceAccountRefAccountConfigController from '../controllers/accountWorkspaceAccountRefAcountConfigController'
import accountWorkspaceAccountRefRoleController from '../controllers/accountWorkspaceAccountRefRoleController'

import {
    IAccount, IRoleRef, IAccountInfo, IAccountConfig, IContactInfo,
    IPassword, ILimitedTransaction, IClientDevice, IAccessToken, IAccountAccountRef,
    IWorkspace, IWorkspaceAccountRef
} from '../dataSource/models/accountModel'


const router: express.Router = express.Router()
const env = Config.getEnv()


// root owner paths
router.get(env.RootApiEndpoint + 'owner', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const [result, statusCode] = await ErrorHandler.execute<IAccount>(async () => {
        return await accountController.getAccount({_id: accountId})
    })

    return res.status(statusCode).send(result)
})

router.put(env.RootApiEndpoint + 'owner', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { nameId, disabled, verified } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IAccount>(async () => {
        if (!accountId) return null
        return await accountController.updateAccount(accountId, nameId, disabled, verified)
    })

    return res.status(statusCode).send(result)
})

router.get(env.RootApiEndpoint + 'owner/accessInfo', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id || ''
    const ua = req.userAgentInfo?.ua
    const token = req.accessToken || undefined

    const [result, statusCode] = await ErrorHandler.execute<IAccessInfo>(async () => {
        return await accountController.getAccountCompleteInfo({_id: accountId, ua, token})
    })

    return res.status(statusCode).send(result)
})

router.get(env.RootApiEndpoint + 'owner/accessInfo/rootAccount/:rootAccountId', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id || ''
    const { rootAccountId } = req.params
    // console.log('account accessInfo: ', rootAccountId, accountId)

    const [result, statusCode] = await ErrorHandler.execute<IAccessInfo>(async () => {
        return await accountAccountRefRoleController.getDefaultMappedRoleRef(rootAccountId, accountId, req.appRole?.absoluteAuthority)
    })

    return res.status(statusCode).send(result)
})

router.get(env.RootApiEndpoint + 'owner/accessInfo/rootAccount/:rootAccountId/rootWorkspace/:rootWorkspaceId', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id || ''
    const { rootAccountId } = req.params
    const { rootWorkspaceId } = req.params

    // console.log('account workspace accessInfo: ', rootAccountId, rootWorkspaceId, accountId)

    const [result, statusCode] = await ErrorHandler.execute<IAccessInfo>(async () => {
        return await accountWorkspaceAccountRefRoleController.getDefaultMappedRoleRef(rootAccountId, rootWorkspaceId, accountId, req.appRole?.absoluteAuthority)
    })

    return res.status(statusCode).send(result)
})


// owner roles routes
router.get(env.RootApiEndpoint + 'owner/roles', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id

    const [result, statusCode] = await ErrorHandler.execute<IRoleRef[]>(async () => {
        if (!accountId) return null
        return await accountRoleController.getRoleRefs(accountId)
    })

    return res.status(statusCode).send(result)
})

router.get(env.RootApiEndpoint + 'owner/roles/:roleRefId', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { roleRefId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IRoleRef>(async () => {
        if (!accountId) return null
        return await accountRoleController.getRoleRef(accountId, roleRefId)
    })

    return res.status(statusCode).send(result)
})

router.delete(env.RootApiEndpoint + 'owner/roles/:roleRefId', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { roleRefId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IRoleRef>(async () => {
        if (!accountId) return null
        return await accountRoleController.deleteRoleRef(accountId, roleRefId)
    })

    return res.status(statusCode).send(result)
})


// owner accountInfo routes
router.get(env.RootApiEndpoint + 'owner/accountInfos', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id

    const [result, statusCode] = await ErrorHandler.execute<IAccountInfo[]>(async () => {
        if (!accountId) return null
        return await accountAccountInfoController.getAccountInfos(accountId)
    })

    return res.status(statusCode).send(result)
})

router.post(env.RootApiEndpoint + 'owner/accountInfos', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { key, value, type } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IAccountInfo>(async () => {
        if (!accountId) return null
        return await accountAccountInfoController.saveAccountInfo(accountId, key, value, type)
    })

    return res.status(statusCode).send(result)
})

router.get(env.RootApiEndpoint + 'owner/accountInfos/:accountInfoId', async (req:Request, res:Response) => {
     const accountId = req?.accountData?._id
    const { accountInfoId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IAccountInfo>(async () => {
        if (!accountId) return null
        return await accountAccountInfoController.getAccountInfo(accountId, accountInfoId)
    })

    return res.status(statusCode).send(result)
})

router.put(env.RootApiEndpoint + 'owner/accountInfos/:accountInfoId', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { accountInfoId } = req.params
    const { key, value, type } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IAccountInfo>(async () => {
        if (!accountId) return null
        return await accountAccountInfoController.updateAccountInfo(accountId, accountInfoId, key, value, type)
    })

    return res.status(statusCode).send(result)
})

router.delete(env.RootApiEndpoint + 'owner/accountInfos/:accountInfoId', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { accountInfoId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IAccountInfo>(async () => {
        if (!accountId) return null
        return await accountAccountInfoController.deleteAccountInfo( accountId, accountInfoId )
    })

    return res.status(statusCode).send(result)
})

// account config
router.get(env.RootApiEndpoint + 'owner/accountConfigs', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id

    const [result, statusCode] = await ErrorHandler.execute<IAccountConfig[]>(async () => {
        if (!accountId) return null
        return await accountAccountConfigController.getAccountConfigs(accountId)
    })

    return res.status(statusCode).send(result)
})

router.get(env.RootApiEndpoint + 'owner/accountConfigs/:accountConfigId', async (req:Request, res:Response) => {
     const accountId = req?.accountData?._id
    const { accountConfigId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IAccountConfig>(async () => {
        if (!accountId) return null
        return await accountAccountConfigController.getAccountConfig(accountId, accountConfigId)
    })

    return res.status(statusCode).send(result)
})

router.put(env.RootApiEndpoint + 'owner/accountConfigs/:accountConfigId', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { accountConfigId } = req.params
    const { value } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IAccountConfig>(async () => {
        if (!accountId) return null
        return await accountAccountConfigController.updateAccountConfig(accountId, accountConfigId, value)
    })

    return res.status(statusCode).send(result)
})


// contact infos routes
router.get(env.RootApiEndpoint + 'owner/contactInfos', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id

    const [result, statusCode] = await ErrorHandler.execute<IContactInfo[]>(async () => {
        if (!accountId) return null
        return await accountContactInfoController.getContactInfos(accountId)
    })

    return res.status(statusCode).send(result)
})

router.post(env.RootApiEndpoint + 'owner/contactInfos', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { type, value, countryCode, verified } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IContactInfo>(async () => {
        if (!accountId) return null
        return await accountContactInfoController.saveContactInfo(accountId, type, value, countryCode, verified)
    })

    return res.status(statusCode).send(result)
})

router.get(env.RootApiEndpoint + 'owner/contactInfos/:contactInfoId', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { contactInfoId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IContactInfo>(async () => {
        if (!accountId) return null
        return await accountContactInfoController.getContactInfo(accountId, contactInfoId)
    })

    return res.status(statusCode).send(result)
})

router.put(env.RootApiEndpoint + 'owner/contactInfos/:contactInfoId', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { contactInfoId } = req.params
    const { type, value, countryCode, verified } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IContactInfo>(async () => {
        if (!accountId) return null
        return await accountContactInfoController.updateContactInfo(accountId, contactInfoId, type, value, countryCode, verified)
    })

    return res.status(statusCode).send(result)
})

router.delete(env.RootApiEndpoint + 'owner/contactInfos/:contactInfoId', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { contactInfoId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IContactInfo>(async () => {
        if (!accountId) return null
        return await accountContactInfoController.deleteContactInfo( accountId, contactInfoId )
    })

    return res.status(statusCode).send(result)
})


// passwords routes
router.get(env.RootApiEndpoint + 'owner/passwords', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id

    const [result, statusCode] = await ErrorHandler.execute<IPassword[]>(async () => {
        if (!accountId) return null
        return await accountPasswordController.getPasswords(accountId)
    })

    return res.status(statusCode).send(result)
})

router.post(env.RootApiEndpoint + 'owner/passwords', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { currentPassword, newPassword } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IPassword>(async () => {
        if (!accountId) return null
        return await accountPasswordController.savePassword(accountId, currentPassword, newPassword)
    })

    return res.status(statusCode).send(result)
})

router.get(env.RootApiEndpoint + 'owner/passwords/:passwordId', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { passwordId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IPassword>(async () => {
        if (!accountId) return null
        return await accountPasswordController.getPassword(accountId, passwordId)
    })

    return res.status(statusCode).send(result)
})

router.delete(env.RootApiEndpoint + 'owner/passwords/:passwordId', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { passwordId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IPassword>(async () => {
        if (!accountId) return null
        return await accountPasswordController.deletePassword( accountId, passwordId )
    })

    return res.status(statusCode).send(result)
})


// limited transaction routes
router.get(env.RootApiEndpoint + 'owner/limitedTransactions', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id

    const [result, statusCode] = await ErrorHandler.execute<ILimitedTransaction[]>(async () => {
        if (!accountId) return null
        return await accountLimitedTransactionController.getLimitedTransactions(accountId)
    })

    return res.status(statusCode).send(result)
})

router.get(env.RootApiEndpoint + 'owner/limitedTransactions/:limitedTransactionId', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { limitedTransactionId } = req.params

    console.log(limitedTransactionId)

    const [result, statusCode] = await ErrorHandler.execute<ILimitedTransaction>(async () => {
        if (!accountId) return null
        return await accountLimitedTransactionController.getLimitedTransaction(accountId, limitedTransactionId)
    })

    return res.status(statusCode).send(result)
})

router.put(env.RootApiEndpoint + 'owner/limitedTransactions/:limitedTransactionId', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { limitedTransactionId } = req.params
    const {
        limit, attempts, key,
        value, recipient,
        disabled
    } = req.body

    const [result, statusCode] = await ErrorHandler.execute<ILimitedTransaction>(async () => {
        if (!accountId) return null
        return await accountLimitedTransactionController.updateLimitedTransaction(
            accountId, limitedTransactionId,
            limit, attempts, key,
            value, recipient,
            disabled
        )
    })

    return res.status(statusCode).send(result)
})


// client device routes
router.get(env.RootApiEndpoint + 'owner/clientDevices', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id

    const [result, statusCode] = await ErrorHandler.execute<IClientDevice[]>(async () => {
        if (!accountId) return null
        return await accountClientDeviceController.getClientDevices(accountId)
    })

    return res.status(statusCode).send(result)
})

router.post(env.RootApiEndpoint + 'owner/clientDevices', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { ua, description, disabled } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IClientDevice>(async () => {
        if (!accountId) return null
        return await accountClientDeviceController.saveClientDevice(accountId, ua, description, disabled)
    })

    return res.status(statusCode).send(result)
})

router.get(env.RootApiEndpoint + 'owner/clientDevices/:clientDeviceId', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { clientDeviceId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IClientDevice>(async () => {
        if (!accountId) return null
        return await accountClientDeviceController.getClientDevice(accountId, clientDeviceId)
    })

    return res.status(statusCode).send(result)
})

router.put(env.RootApiEndpoint + 'owner/clientDevices/:clientDeviceId', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { clientDeviceId } = req.params
    const { ua, description, disabled } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IClientDevice>(async () => {
        if (!accountId) return null
        return await accountClientDeviceController.updateClientDevice(accountId, clientDeviceId, ua, description, disabled)
    })

    return res.status(statusCode).send(result)
})

router.delete(env.RootApiEndpoint + 'owner/clientDevices/:clientDeviceId', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { clientDeviceId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IClientDevice>(async () => {
        if (!accountId) return null
        return await accountClientDeviceController.deleteClientDevice( accountId, clientDeviceId )
    })

    return res.status(statusCode).send(result)
})


// client devices access token
router.get(env.RootApiEndpoint + 'owner/clientDevices/:clientDeviceId/accessTokens', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { clientDeviceId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IAccessToken[]>(async () => {
        if (!accountId) return null
        return await accountClientDeviceAccessTokenController.getClientDeviceAccessTokens(accountId, clientDeviceId)
    })

    return res.status(statusCode).send(result)
})

router.post(env.RootApiEndpoint + 'owner/clientDevices/:clientDeviceId/accessTokens', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { clientDeviceId } = req.params
    const { expiration, description, ipAddress, disabled } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IAccessToken>(async () => {
        if (!accountId) return null
        return await accountClientDeviceAccessTokenController.saveClientDeviceAccessToken(accountId, clientDeviceId, expiration, description, ipAddress, disabled)
    })

    return res.status(statusCode).send(result)
})

router.get(env.RootApiEndpoint + 'owner/clientDevices/:clientDeviceId/accessTokens/:accessTokenId', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { clientDeviceId, accessTokenId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IAccessToken>(async () => {
        if (!accountId) return null
        return await accountClientDeviceAccessTokenController.getClientDeviceAccessToken(accountId, clientDeviceId, accessTokenId)
    })

    return res.status(statusCode).send(result)
})

router.put(env.RootApiEndpoint + 'owner/clientDevices/:clientDeviceId/accessTokens/:accessTokenId', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { clientDeviceId, accessTokenId } = req.params
    const { description, ipAddress, disabled } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IAccessToken>(async () => {
        if (!accountId) return null
        return await accountClientDeviceAccessTokenController.updateClientDeviceAccessToken(accountId, clientDeviceId, accessTokenId, description, ipAddress, disabled)
    })

    return res.status(statusCode).send(result)
})

router.delete(env.RootApiEndpoint + 'owner/clientDevices/:clientDeviceId/accessTokens/:accessTokenId', async (req:Request, res:Response) => {
    const accountId = req?.accountData?._id
    const { clientDeviceId, accessTokenId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IAccessToken>(async () => {
        if (!accountId) return null
        return await accountClientDeviceAccessTokenController.deleteClientDeviceAccessToken( accountId, clientDeviceId, accessTokenId )
    })

    return res.status(statusCode).send(result)
})

// account refs
router.get(env.RootApiEndpoint + 'owner/accountRefs', async (req, res) => {
    const accountId = req?.accountData?._id || ''

    const [result, statusCode] = await ErrorHandler.execute<(IAccountAccountRef & {nameId?:string})[]>(async () => {
        return await accountAccountRefController.getAccountRefs(accountId)
    })

    return res.status(statusCode).send(result)
})

router.post(env.RootApiEndpoint + 'owner/accountRefs', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { nameId, disabled } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IAccountAccountRef>(async () => {
        return await accountAccountRefController.saveAccountAccountRef(accountId, nameId, disabled)
    })

    return res.status(statusCode).send(result)
})

router.get(env.RootApiEndpoint + 'owner/accountRefs/:accountRefId', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { accountRefId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IAccountAccountRef & {nameId?:string}>(async () => {
        return await accountAccountRefController.getAccountRef(accountId, accountRefId)
    })

    return res.status(statusCode).send(result)
})

router.put(env.RootApiEndpoint + 'owner/accountRefs/:accountRefId', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { accountRefId } = req.params
    const { disabled } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IAccountAccountRef>(async () => {
        return await accountAccountRefController.updateAccountAccountRef(accountId, accountRefId, disabled)
    })

    return res.status(statusCode).send(result)
})

router.delete(env.RootApiEndpoint + 'owner/accountRefs/:accountRefId', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { accountRefId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IAccountAccountRef>(async () => {
        return await accountAccountRefController.deleteAccountAccountRef( accountId, accountRefId )
    })

    return res.status(statusCode).send(result)
})

// account ref roles
router.get(env.RootApiEndpoint + 'owner/accountRefs/:accountRefId/roles', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { accountRefId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IRoleRef[]>(async () => {
        return await accountAccountRefRoleController.getRoleRefs(accountId, accountRefId)
    })

    return res.status(statusCode).send(result)
})

router.get(env.RootApiEndpoint + 'owner/accountRefs/:accountRefId/roles/:roleRefId', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { accountRefId, roleRefId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IRoleRef>(async () => {
        return await accountAccountRefRoleController.getRoleRef(accountId, accountRefId, roleRefId)
    })

    return res.status(statusCode).send(result)
})

router.post(env.RootApiEndpoint + 'owner/accountRefs/:accountRefId/roles', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { accountRefId } = req.params
    const { roleId } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IRoleRef>(async () => {
        return await accountAccountRefRoleController.saveRoleRef(accountId, accountRefId, roleId)
    })

    return res.status(statusCode).send(result)
})

router.put(env.RootApiEndpoint + 'owner/accountRefs/:accountRefId/roles/:roleRefId', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { accountRefId, roleRefId } = req.params
    const { roleId } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IRoleRef>(async () => {
        return await accountAccountRefRoleController.updateRoleRef(accountId, accountRefId, roleRefId, roleId)
    })

    return res.status(statusCode).send(result)
})

router.delete(env.RootApiEndpoint + 'owner/accountRefs/:accountRefId/roles/:roleRefId', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { accountRefId, roleRefId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IRoleRef>(async () => {
        return await accountAccountRefRoleController.deleteRoleRef(accountId, accountRefId, roleRefId)
    })

    return res.status(statusCode).send(result)
})

// account ref account configs
router.get(env.RootApiEndpoint + 'owner/accountRefs/:accountRefId/accountConfigs', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { accountRefId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IAccountConfig[]>(async () => {
        return await accountAccountRefAccountConfigController.getAccountConfigs(accountId, accountRefId)
    })

    return res.status(statusCode).send(result)
})

router.get(env.RootApiEndpoint + 'owner/accountRefs/:accountRefId/accountConfigs/:accountConfigId', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { accountRefId, accountConfigId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IAccountConfig>(async () => {
        return await accountAccountRefAccountConfigController.getAccountConfig(accountId, accountRefId, accountConfigId)
    })

    return res.status(statusCode).send(result)
})

router.put(env.RootApiEndpoint + 'owner/accountRefs/:accountRefId/accountConfigs/:accountConfigId', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { accountRefId, accountConfigId } = req.params
    const { value } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IAccountConfig>(async () => {
        return await accountAccountRefAccountConfigController.updateAccountConfig(accountId, accountRefId, accountConfigId, value)
    })

    return res.status(statusCode).send(result)
})

// workspaces
router.get(env.RootApiEndpoint + 'owner/workspaces', async (req, res) => {
    const accountId = req?.accountData?._id || ''

    const [result, statusCode] = await ErrorHandler.execute<IWorkspace[]>(async () => {
        return await accountWorkspaceController.getWorkspaces(accountId)
    })

    return res.status(statusCode).send(result)
})

router.post(env.RootApiEndpoint + 'owner/workspaces', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { name, description, disabled } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IWorkspace>(async () => {
        return await accountWorkspaceController.saveWorkspace(accountId, name, description, disabled)
    })

    return res.status(statusCode).send(result)
})

router.get(env.RootApiEndpoint + 'owner/workspaces/:workspaceId', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { workspaceId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IWorkspace>(async () => {
        return await accountWorkspaceController.getWorkspace(accountId, workspaceId)
    })

    return res.status(statusCode).send(result)
})

router.put(env.RootApiEndpoint + 'owner/workspaces/:workspaceId', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { workspaceId } = req.params
    const { name, description, disabled } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IWorkspace>(async () => {
        return await accountWorkspaceController.updateWorkspace(accountId, workspaceId, name, description, disabled)
    })

    return res.status(statusCode).send(result)
})

router.delete(env.RootApiEndpoint + 'owner/workspaces/:workspaceId', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { workspaceId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IWorkspace>(async () => {
        return await accountWorkspaceController.deleteWorkspace( accountId, workspaceId )
    })

    return res.status(statusCode).send(result)
})

// workspace account refs
router.get(env.RootApiEndpoint + 'owner/workspaces/:workspaceId/accountRefs', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { workspaceId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<(IWorkspaceAccountRef & {nameId?:string})[]>(async () => {
        return await accountWorkspaceAccountRefController.getWorkspaceAccountRefs(accountId, workspaceId)
    })

    return res.status(statusCode).send(result)
})

router.post(env.RootApiEndpoint + 'owner/workspaces/:workspaceId/accountRefs', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { workspaceId } = req.params
    const { nameId, readAccess, updateAccess, createAccess, deleteAccess, disabled } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IWorkspaceAccountRef>(async () => {
        return await accountWorkspaceAccountRefController.saveWorkspaceAccountRef(accountId, workspaceId, nameId, disabled)
    })

    return res.status(statusCode).send(result)
})

router.get(env.RootApiEndpoint + 'owner/workspaces/:workspaceId/accountRefs/:accountRefId', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { workspaceId, accountRefId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IWorkspaceAccountRef & {nameId?:string}>(async () => {
        return await accountWorkspaceAccountRefController.getWorkspaceAccountRef(accountId, workspaceId, accountRefId)
    })

    return res.status(statusCode).send(result)
})

router.put(env.RootApiEndpoint + 'owner/workspaces/:workspaceId/accountRefs/:accountRefId', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { workspaceId, accountRefId } = req.params
    const { readAccess, updateAccess, createAccess, deleteAccess, disabled } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IWorkspaceAccountRef>(async () => {
        return await accountWorkspaceAccountRefController.updateWorkspaceAccountRef(accountId, workspaceId, accountRefId, disabled)
    })

    return res.status(statusCode).send(result)
})

router.delete(env.RootApiEndpoint + 'owner/workspaces/:workspaceId/accountRefs/:accountRefId', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { workspaceId, accountRefId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IWorkspaceAccountRef>(async () => {
        return await accountWorkspaceAccountRefController.deleteWorkspaceAccountRef( accountId, workspaceId, accountRefId )
    })

    return res.status(statusCode).send(result)
})


router.get(env.RootApiEndpoint + 'owner/workspaces/:workspaceId/accountRefs/:accountRefId/accountConfigs', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { workspaceId, accountRefId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IAccountConfig[]>(async () => {
        return await accountWorkspaceAccountRefAccountConfigController.getAccountConfigs(accountId, workspaceId, accountRefId)
    })

    return res.status(statusCode).send(result)
})

router.get(env.RootApiEndpoint + 'owner/workspaces/:workspaceId/accountRefs/:accountRefId/accountConfigs/:accountConfigId', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { workspaceId, accountRefId, accountConfigId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IAccountConfig>(async () => {
        return await accountWorkspaceAccountRefAccountConfigController.getAccountConfig(accountId, workspaceId, accountRefId, accountConfigId)
    })

    return res.status(statusCode).send(result)
})

router.put(env.RootApiEndpoint + 'owner/workspaces/:workspaceId/accountRefs/:accountRefId/accountConfigs/:accountConfigId', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { workspaceId, accountRefId, accountConfigId } = req.params
    const { value } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IAccountConfig>(async () => {
        return await accountWorkspaceAccountRefAccountConfigController.updateAccountConfig(accountId, workspaceId, accountRefId, accountConfigId, value)
    })

    return res.status(statusCode).send(result)
})

router.get(env.RootApiEndpoint + 'owner/workspaces/:workspaceId/accountRefs/:accountRefId/roles', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { workspaceId, accountRefId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IRoleRef[]>(async () => {
        return await accountWorkspaceAccountRefRoleController.getRoleRefs(accountId, workspaceId, accountRefId)
    })

    return res.status(statusCode).send(result)
})

router.get(env.RootApiEndpoint + 'owner/workspaces/:workspaceId/accountRefs/:accountRefId/roles/:roleRefId', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { workspaceId, accountRefId, roleRefId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IRoleRef>(async () => {
        return await accountWorkspaceAccountRefRoleController.getRoleRef(accountId, workspaceId, accountRefId, roleRefId)
    })

    return res.status(statusCode).send(result)
})

router.post(env.RootApiEndpoint + 'owner/workspaces/:workspaceId/accountRefs/:accountRefId/roles', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { workspaceId, accountRefId } = req.params
    const { roleId } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IRoleRef>(async () => {
        return await accountWorkspaceAccountRefRoleController.saveRoleRef(accountId, workspaceId, accountRefId, roleId)
    })

    return res.status(statusCode).send(result)
})

router.put(env.RootApiEndpoint + 'owner/workspaces/:workspaceId/accountRefs/:accountRefId/roles/:roleRefId', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { workspaceId, accountRefId, roleRefId } = req.params
    const { roleId } = req.body

    const [result, statusCode] = await ErrorHandler.execute<IRoleRef>(async () => {
        return await accountWorkspaceAccountRefRoleController.updateRoleRef(accountId, workspaceId, accountRefId, roleRefId, roleId)
    })

    return res.status(statusCode).send(result)
})

router.delete(env.RootApiEndpoint + 'owner/workspaces/:workspaceId/accountRefs/:accountRefId/roles/:roleRefId', async (req, res) => {
    const accountId = req?.accountData?._id || ''
    const { workspaceId, accountRefId, roleRefId } = req.params

    const [result, statusCode] = await ErrorHandler.execute<IRoleRef>(async () => {
        return await accountWorkspaceAccountRefRoleController.deleteRoleRef(accountId, workspaceId, accountRefId, roleRefId)
    })

    return res.status(statusCode).send(result)
})

routerIdentity.addAppRouteObj(router)
export default router