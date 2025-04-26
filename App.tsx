import { LegendList } from '@legendapp/list';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

interface PostItem {
  id: string;
  title: string;
  body: string;
}

const generateMockData = (count: number): PostItem[] => {
  return Array(count).fill(0).map((_, index) => ({
    id: `item-${index + 1}`,
    title: `Post ${index + 1}`,
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  }));
};

const ALL_MOCK_DATA: PostItem[] = generateMockData(1000);

const ITEMS_PER_PAGE = 15;

const keyExtractor = (item: PostItem): string => item.id;

const performHeavyComputation = (): void => {
  const start = Date.now();
  while (Date.now() - start < 50) {
    Math.random() * Math.random();
  }
};

interface SlowItemProps {
  item: PostItem;
}

const SlowItem: React.FC<SlowItemProps> = React.memo(({ item }) => {
  performHeavyComputation();
  performHeavyComputation();
  performHeavyComputation();


  const wastefulArray = useMemo(() => {
    return Array(50000).fill(0).map((_, i) =>
      `${item.title}-${i}-${new Date().getTime()}`
    );
  }, [item.title]);

  const dynamicFontSize = useMemo(() => {
    performHeavyComputation();
    return 14 + (item.id.length % 3);
  }, [item.id]);

  return (
    <View style={styles.itemContainer}>
      <Text style={[styles.title, { opacity: 0.9 + Math.random() * 0.1 }]}>
        {item.title}
      </Text>
      <Text style={[styles.body, { fontSize: dynamicFontSize }]}>
        {item.body}
        <Text style={{ height: 0, width: 0, opacity: 0 }}>
          {wastefulArray[0]}
        </Text>
      </Text>
    </View>
  );
});

function App(): React.JSX.Element {
  const [data, setData] = useState<PostItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const loadMockData = useCallback((pageNumber: number = 1, isRefreshing: boolean = false) => {

    setLoading(true);

    setTimeout(() => {
      const startIndex = (pageNumber - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newItems = ALL_MOCK_DATA.slice(startIndex, endIndex);

      if (isRefreshing) {
        setData(newItems);
      } else {
        setData(prevData => [...prevData, ...newItems]);
      }

      setPage(pageNumber);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    loadMockData();

    return () => {
      setData([]);
      setPage(1);
      setLoading(false);
    };
  }, []);

  const handleEndReached = useCallback(() => {
    if (!loading) {
      loadMockData(page + 1);
    }
  }, [loading, page, loadMockData]);

  const renderItem = useCallback(({ item }: { item: PostItem }) => (
    <SlowItem item={item} />
  ), []);

  const renderFooter = useCallback(() => {
    if (!loading) {
      return null;
    }

    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }, [loading]);

  return (
    <View style={styles.container}>
      <LegendList // If you switch to Flatlist the bug won't reproduce
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        drawDistance={2500}
        recycleItems
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: '#666666',
  },
  footerContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 10,
  },
});

export default App;