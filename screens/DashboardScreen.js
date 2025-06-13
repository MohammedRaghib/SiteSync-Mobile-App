import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import useCheckInfo from '../services/UserContext';

export default function DashboardScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useCheckInfo();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const username = user?.username;
        const password = user?.password;

        const tokenResponse = await fetch('https://sitesync.angelightrading.com/home/angeligh/sitesyncdjango/api/token/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const tokenData = await tokenResponse.json();
        const access = tokenData.access;

        const dataResponse = await fetch('https://sitesync.angelightrading.com/home/angeligh/sitesyncdjango/api/supervisor_dashboard/', {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });

        const json = await dataResponse.json();
        setData(json.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;

  return (
    <ScrollView horizontal>
      <View>
        {/* Table Header */}
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.cell, styles.header]}>ID</Text>
          <Text style={[styles.cell, styles.header]}>Name</Text>
          <Text style={[styles.cell, styles.header]}>Role</Text>
        </View>
        {Array.isArray(data) && data.map((item, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.cell}>{item.attendance_subject.person_name}</Text>
          <Text style={styles.cell}>
          {item.attendance_is_check_in ? 'Checked In' : 'Checked Out'}
        </Text>
    </View>
))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
  },
  cell: {
    flex: 1,
    paddingHorizontal: 10,
  },
  headerRow: {
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 2,
  },
  header: {
    fontWeight: 'bold',
  },
});
