import os

import psycopg2
from elasticsearch import Elasticsearch


class Connection:
    postgres_connection = None
    elasticsearch_connection = None

    @staticmethod
    def get_postgres_connection():
        if Connection.postgres_connection is None:
            Connection.postgres_connection = psycopg2.connect(host=os.getenv('FLASK_POSTGRES_HOST', 'gmd_postgres'),
                                                              port=int(5432),
                                                              database=os.getenv('FLASK_POSTGRES_DB', 'toto'),
                                                              user=os.getenv('FLASK_POSTGRES_USER', 'user'),
                                                              password=os.getenv('FLASK_POSTGRES_PASSWORD', 'toto'))
        return Connection.postgres_connection

    @staticmethod
    def get_elasticsearch_connection():
        if Connection.elasticsearch_connection is None:
            Connection.elasticsearch_connection = Elasticsearch(
                [{'host': os.getenv('FLASK_ELASTIC_HOST', 'gmd_elastic'),
                  'port': 9200,
                  'scheme': 'http'}],
                basic_auth=(os.getenv('FLASK_ELASTIC_USER', 'user'), os.getenv('FLASK_ELASTIC_PASSWORD', 'user'))
            )
            if not Connection.elasticsearch_connection.indices.exists(index="patients"):
                Connection.elasticsearch_connection.indices.create(index="patients")
        return Connection.elasticsearch_connection
