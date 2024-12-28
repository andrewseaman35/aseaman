from dataclasses import dataclass
import json

from base.dynamodb import BudgetFileEntryDDBItem


class BudgetConfig(object):
    def __init__(self, config):
        self._config = config
        self.categories = sorted(self._config["categorization"].keys())
        self.categorization = self._config["categorization"]
        self.search_terms = self.get_search_term_dict()

    def serialize(self):
        return json.dumps(self._config, indent=4, sort_keys=True)

    def get_search_term_dict(self):
        search_term_to_category = {}
        for category, terms in self.categorization.items():
            for term in terms:
                if term in search_term_to_category:
                    raise Exception("repeated term in categorization: {}".format(term))
                search_term_to_category[term.lower()] = category.lower()
        return search_term_to_category


@dataclass
class BudgetEntry:
    entry: BudgetFileEntryDDBItem
    overridden_category: str = None
    category_options: list[str] = None
    requires_resolution: bool = False

    def __getattr__(self, key):
        if key not in {
            "amount",
            "overridden_category",
            "category_options",
            "requires_resolution",
        }:
            return self.entry.__getattr__(key)
        return super(self.__class__, self).__getattr__(key)

    def to_dict(self):
        return {
            **self.entry.to_dict(),
            "category": self.overridden_category,
        }


class BudgetSummary:
    UNCATEGORIZED = "uncategorized"
    PAYMENT_CATEGORY = "payment"

    def __init__(self, transactions, config):
        self._transactions = transactions
        self._config = config
        self._summary = {}
        self._total = 0
        self._transactions_by_category = {
            c: []
            for c in config.categories + [self.UNCATEGORIZED, self.PAYMENT_CATEGORY]
        }
        self._total_by_category = {
            c: 0
            for c in config.categories + [self.UNCATEGORIZED, self.PAYMENT_CATEGORY]
        }
        self._requires_resolution = []

    def _find_category(self, transaction):
        if transaction.transaction_type != "Sale":
            return self.PAYMENT_CATEGORY

        found_terms = set()
        for term in self._config.search_terms:
            if term in transaction.description.lower():
                found_terms.add(term)

        found_categories = {self._config.search_terms[t] for t in found_terms}
        if len(found_categories) in {0, 1}:
            return next(iter(found_categories), self.UNCATEGORIZED)

        return list(found_categories)

    def generate_budget_entry(self, transaction):
        category = self._find_category(transaction)
        if isinstance(category, list):
            entry = BudgetEntry(
                transaction, category_options=category, requires_resolution=True
            )
        else:
            entry = BudgetEntry(
                transaction,
                overridden_category=category,
            )
        return entry

    def organize_by_month(self, entries):
        by_month = {i: [] for i in range(1, 13)}
        for e in entries:
            by_month[int(e.transaction_month)].append(e.to_dict())
        return by_month

    def summarize_to_dict(self):
        entries = [
            self.generate_budget_entry(transaction)
            for transaction in self._transactions
        ]

        return {
            "entries": [e.to_dict() for e in entries],
            "monthly": self.organize_by_month(entries),
        }

    def serialize(self):
        return json.dumps(
            {
                "categories": self._config.categories,
                **self.summarize_to_dict(),
            }
        )
