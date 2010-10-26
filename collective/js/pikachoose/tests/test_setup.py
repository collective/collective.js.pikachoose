import unittest
from collective.js.pikachoose.tests.base import TestCase

class TestSetup(TestCase):
    """The name of the class should be meaningful. This may be a class that
    tests the installation of a particular product.
    """

    def test_js_registred(self):
        resources = self.portal.portal_javascripts.getResourcesDict().keys()
        resource = '++resource++jquery.pikachoose-4.0.4.js'
        self.failUnless(resource in resources)

def test_suite():
    """
    """
    suite = unittest.TestSuite()
    suite.addTest(unittest.makeSuite(TestSetup))
    return suite
