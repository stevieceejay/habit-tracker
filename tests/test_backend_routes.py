import unittest

from app import create_app


class BackendRouteStructureTests(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_health_and_habit_routes(self):
        health_response = self.client.get('/health')
        self.assertEqual(health_response.status_code, 200)
        self.assertEqual(health_response.get_json()['status'], 'ok')

        create_response = self.client.post('/habits', json={'name': 'Read 20 minutes'})
        self.assertEqual(create_response.status_code, 201)
        payload = create_response.get_json()
        self.assertIn('habit', payload)
        self.assertEqual(payload['habit']['name'], 'Read 20 minutes')

        list_response = self.client.get('/habits')
        self.assertEqual(list_response.status_code, 200)
        habits = list_response.get_json()['habits']
        self.assertTrue(any(item['id'] == payload['habit']['id'] for item in habits))


if __name__ == '__main__':
    unittest.main()
