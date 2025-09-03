import requests
import os

VERIFY_URL = "https://api.veryfi.com/api/v8/partner/documents"

STUB_RESPONSE = True


class VeryfiClient:
    """
    Client for Veryfi API.
    """

    def __init__(self, client_id: str, auth_token: str, verify_username: str):
        self.verify_username = verify_username
        self.client_id = client_id
        self.auth_token = auth_token

    def get_headers(self) -> dict:
        return {
            "CLIENT-ID": self.client_id,
            "AUTHORIZATION": f"apikey {self.verify_username}:{self.auth_token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def extract_via_verify(self, file_url: str) -> dict:
        payload = {
            "file_url": file_url,
        }
        print(payload)
        print("HEADERFS")
        print(self.get_headers())

        if STUB_RESPONSE:
            with open("mock_response.json", "r") as f:
                response = json.loads(f.read())

            return response

        response = requests.post(VERIFY_URL, headers=self.get_headers(), json=payload)
        return response.json()

        import json


if __name__ == "__main__":
    client = VeryfiClient(CLIENT_ID, AUTH_TOKEN)
    # Example usage
    file_url = "https://aseaman-public-bucket.s3.us-east-1.amazonaws.com/splitomatic/splitomatic_receipt_1.jpg"
    try:
        result = client.extract_via_verify(file_url)
        print(result)
    except Exception as e:
        print(f"Error: {e}")
