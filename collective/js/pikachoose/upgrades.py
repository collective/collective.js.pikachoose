from Products.CMFCore.utils import getToolByName
PROFILE = 'profile-collective.js.pikachose:default'


def common_upgrade(context):

    setup = getToolByName(context, 'portal_setup')
    setup.runAllImportStepsFromProfile(PROFILE)
