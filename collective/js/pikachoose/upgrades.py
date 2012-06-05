from Products.CMFCore.utils import getToolByName

def upgrade_4_10(context):

    jsregistry = getToolByName(context, 'portal_javascripts')
    jsregistry.unregisterResource('jquery.pikachoose-4.0.4.js')
    
    setup = getToolByName(context, 'portal_setup')
    setup.runImportStepFromProfile('profile-collective.js.pikachose:default',
                                   'jsregistry', run_dependencies=False,
                                   purge_old=False)

    cook_resources(context)

def cook_resources(context):
    """Refresh javascript and css"""
    jsregistry = getToolByName(context, 'portal_javascripts')
    cssregistry = getToolByName(context, 'portal_css')

    jsregistry.cookResources()
    cssregistry.cookResources()
