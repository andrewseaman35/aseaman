import pickle


class CachedDataStore:
    __data: dict = {}

    def __contains__(self, key):
        return key in self.__data

    def get(self, key):
        if key in self.__data:
            return pickle.loads(self.__data[key])
        return None

    def put(self, key, value):
        self.__data[key] = pickle.dumps(value)
