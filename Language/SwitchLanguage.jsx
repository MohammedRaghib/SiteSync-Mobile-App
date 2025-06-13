import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from './i18n';

const SwitchLanguage = () => {
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={() => changeLanguage('en')}>
                <Text style={styles.buttonText}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => changeLanguage('zh')}>
                <Text style={styles.buttonText}>中文</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute', 
        bottom: 20,           
        right: 20,             
        zIndex: 999,          
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
        padding: 10,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5, 
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginHorizontal: 5,
    },
});


export default SwitchLanguage;