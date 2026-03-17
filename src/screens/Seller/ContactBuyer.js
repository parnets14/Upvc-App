import React, { useState, useEffect } from 'react';
import {
  View, 
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Linking,
  Share,
  Alert,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; 
import IconFA from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import AppText from '../../components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNShare from 'react-native-share';
import { PermissionsAndroid } from 'react-native';
import Toast from 'react-native-toast-message';

const ContactBuyer = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { lead } = route.params; 
  
  const scaleAnim = useState(new Animated.Value(1))[0];

  // Extract buyer details from the lead data
  const buyerDetails = {
    personal: {
      fullName: lead.rawData.contactInfo.name,
      contactNumber: lead.rawData.contactInfo.contactNumber,
      whatsappNumber: lead.rawData.contactInfo.whatsappNumber,
      email: lead.rawData.contactInfo.email,
    },
    project: {
      name: lead.rawData.projectInfo.name,
      address: lead.rawData.projectInfo.address,
      pinCode: lead.rawData.projectInfo.pincode,
      stage: lead.rawData.projectInfo.stage,
      timeline: lead.rawData.projectInfo.timeline,
      totalSqFt: `${lead.rawData.totalSqft} sq ft`,
      category: lead.rawData.category?.name || 'Window',
      googleMapLink: lead.rawData.projectInfo.googleMapLink,
    },
  };

  // Format quotes as selected items
  const selectedItems = lead.rawData.quotes.map((quote, index) => ({
    id: index + 1,
    design: quote.product.title,
    color: quote.color,
    size: `${quote.width}ft x ${quote.height}ft`,
    where: quote.installationLocation.replace(/_/g, ' '),
    qty: quote.quantity,
    total: `${quote.sqft} sq ft`,
    remarks: quote.remark || 'No remarks',
  }));

  // Calculate totals
  const totalSqFt = lead.rawData.totalSqft;
  const totalQuantity = lead.rawData.totalQuantity;

  // Function to make a phone call
  const makePhoneCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(err => {
      Alert.alert('Error', 'Unable to make a call');
      console.error('Error making call:', err);
    });
  };

  // Function to open WhatsApp
  const openWhatsApp = (whatsappNumber) => {
    // Remove any non-digit characters from the number
    const cleanedNumber = whatsappNumber.replace(/\D/g, '');
    const url = `whatsapp://send?phone=${cleanedNumber}`;
    
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'WhatsApp is not installed on your device');
        }
      })
      .catch(err => {
        Alert.alert('Error', 'Unable to open WhatsApp');
        console.error('Error opening WhatsApp:', err);
      });
  };

  const generatePDF = async () => {
    try {
      // Create HTML content for the PDF
      const itemsHtml = selectedItems.map(item => `
        <tr>
          <td>${item.id}</td>
          <td>${item.design}</td>
          <td>${item.color}</td>
          <td>${item.size}</td>
          <td>${item.where}</td>
          <td>${item.qty}</td>
          <td>${item.total}</td>
          <td>${item.remarks}</td>
        </tr>
      `).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Buyer Details</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
              h1 { text-align: center; color: #2c3e50; margin-bottom: 20px; }
              h2 { color: #34495e; border-bottom: 2px solid #eee; padding-bottom: 10px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              th { background-color: #f8f9fa; font-weight: bold; }
              .section { margin-bottom: 30px; }
              .contact-info { margin-bottom: 20px; }
              .contact-info div { margin-bottom: 8px; }
              .summary { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>Buyer Details Report</h1>
            
            <div class="section">
              <h2>Personal Information</h2>
              <div class="contact-info">
                <div><strong>Full Name:</strong> ${buyerDetails.personal.fullName}</div>
                <div><strong>Contact Number:</strong> ${buyerDetails.personal.contactNumber}</div>
                <div><strong>WhatsApp Number:</strong> ${buyerDetails.personal.whatsappNumber}</div>
                <div><strong>Email:</strong> ${buyerDetails.personal.email}</div>
              </div>
            </div>

            <div class="section">
              <h2>Project Information</h2>
              <div class="contact-info">
                <div><strong>Project Name:</strong> ${buyerDetails.project.name}</div>
                <div><strong>Category:</strong> ${buyerDetails.project.category}</div>
                <div><strong>Address:</strong> ${buyerDetails.project.address}, ${buyerDetails.project.pinCode}</div>
                <div><strong>Google Map Link:</strong> ${buyerDetails.project.googleMapLink}</div>
                <div><strong>Stage:</strong> ${buyerDetails.project.stage}</div>
                <div><strong>Timeline:</strong> ${buyerDetails.project.timeline}</div>
                <div><strong>Total Area:</strong> ${buyerDetails.project.totalSqFt}</div>
              </div>
            </div>

            <div class="section">
              <h2>Selected Items</h2>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Design</th>
                    <th>Color</th>
                    <th>Size</th>
                    <th>Location</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <div class="summary">
              <h2>Summary</h2>
              <div><strong>Total Square Feet:</strong> ${totalSqFt}</div>
              <div><strong>Total Quantity:</strong> ${totalQuantity}</div>
            </div>

            <div style="margin-top: 30px; text-align: center; color: #7f8c8d; font-size: 12px;">
              Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </div>
          </body>
        </html>
      `;

      // Convert HTML to PDF
      const options = {
        html: htmlContent,
        fileName: `Buyer_Details_${buyerDetails.personal.fullName.replace(/\s+/g, '_')}_${Date.now()}`,
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      return file.filePath;
    } catch (err) {
      console.error('Error generating PDF:', err);
      Alert.alert('Error', 'Failed to generate PDF');
      return null;
    }
  };


  const openMap = () => {
    const mapUrl = buyerDetails.project.googleMapLink || 
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(buyerDetails.project.address)}`;
    Linking.openURL(mapUrl).catch(err => {
      Alert.alert('Error', 'Unable to open maps');
      console.error('Error opening maps:', err);
    });
  };

  // PDF Generation Functions
  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'UPVC Connect needs access to your storage to save buyer details PDFs.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Allow',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  };

  const generateBuyerDetailsPDF = async () => {
    try {
      Toast.show({
        type: 'info',
        position: 'top',
        text1: 'Generating PDF',
        text2: 'Please wait...',
        visibilityTime: 2000,
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Buyer Details</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background-color: #fff;
                    color: #000;
                }
                .header {
                    border-bottom: 2px solid #000;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .company-name {
                    font-size: 24px;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 10px;
                }
                .invoice-title {
                    font-size: 20px;
                    text-align: center;
                    margin-bottom: 20px;
                }
                .details-section {
                    margin-bottom: 30px;
                    padding: 20px;
                    border: 1px solid #ddd;
                }
                .details-row {
                    display: table;
                    width: 100%;
                }
                .details-column {
                    display: table-cell;
                    width: 50%;
                    vertical-align: top;
                    padding-right: 30px;
                }
                .details-label {
                    font-weight: bold;
                    font-size: 12px;
                    color: #666;
                    margin-bottom: 10px;
                }
                .company-name-bold {
                    font-weight: bold;
                    font-size: 16px;
                    margin-bottom: 5px;
                }
                .details-text {
                    font-size: 14px;
                    margin-bottom: 3px;
                }
                .table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                }
                .table th, .table td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                .table th {
                    background-color: #f2f2f2;
                    font-weight: bold;
                }
                .summary {
                    background-color: #f9f9f9;
                    padding: 15px;
                    border: 1px solid #ddd;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-name">UPVC Connect Pvt Ltd</div>
                <div class="invoice-title">BUYER DETAILS REPORT</div>
            </div>

            <div class="details-section">
                <div class="details-row">
                    <div class="details-column">
                        <div class="details-label">PERSONAL INFORMATION</div>
                        <div class="company-name-bold">${buyerDetails.personal.fullName}</div>
                        <div class="details-text">Contact: ${buyerDetails.personal.contactNumber}</div>
                        <div class="details-text">WhatsApp: ${buyerDetails.personal.whatsappNumber}</div>
                        <div class="details-text">Email: ${buyerDetails.personal.email}</div>
                    </div>
                    <div class="details-column">
                        <div class="details-label">PROJECT INFORMATION</div>
                        <div class="company-name-bold">${buyerDetails.project.name}</div>
                        <div class="details-text">Category: ${buyerDetails.project.category}</div>
                        <div class="details-text">Stage: ${buyerDetails.project.stage}</div>
                        <div class="details-text">Timeline: ${buyerDetails.project.timeline}</div>
                    </div>
                </div>
            </div>

            <div class="details-section">
                <div class="details-label">PROJECT ADDRESS</div>
                <div class="details-text">${buyerDetails.project.address}</div>
                <div class="details-text">Pin Code: ${buyerDetails.project.pinCode}</div>
                <div class="details-text">Total Area: ${buyerDetails.project.totalSqFt}</div>
            </div>

            <table class="table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Design</th>
                        <th>Color</th>
                        <th>Size</th>
                        <th>Location</th>
                        <th>Quantity</th>
                        <th>Total Sq Ft</th>
                        <th>Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    ${selectedItems.map(item => `
                        <tr>
                            <td>${item.id}</td>
                            <td>${item.design}</td>
                            <td>${item.color}</td>
                            <td>${item.size}</td>
                            <td>${item.where}</td>
                            <td>${item.qty}</td>
                            <td>${item.total}</td>
                            <td>${item.remarks}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="summary">
                <div class="details-label">SUMMARY</div>
                <div class="details-text">Total Square Feet: ${totalSqFt}</div>
                <div class="details-text">Total Quantity: ${totalQuantity}</div>
                <div class="details-text">Generated on: ${new Date().toLocaleDateString()}</div>
            </div>
        </body>
        </html>
      `;

      const options = {
        html: htmlContent,
        fileName: `Buyer_Details_${buyerDetails.personal.fullName.replace(/\s+/g, '_')}`,
        directory: 'Downloads',
        base64: false,
        width: 595,
        height: 842,
        padding: 20,
        bgColor: '#FFFFFF',
      };

      const pdf = await RNHTMLtoPDF.convert(options);
      
      if (pdf && pdf.filePath) {
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'PDF Downloaded Successfully!',
          text2: `Saved to: ${pdf.filePath}`,
          visibilityTime: 5000,
        });
        
        return `file://${pdf.filePath}`;
      } else {
        throw new Error('PDF generation failed - no file path returned');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      
      // Check if it's a permission error
      if (error.message.includes('permission') || error.message.includes('Permission')) {
        const hasPermission = await requestStoragePermission();
        if (hasPermission) {
          // Retry PDF generation
          try {
            const retryPdf = await RNHTMLtoPDF.convert(options);
            if (retryPdf && retryPdf.filePath) {
              Toast.show({
                type: 'success',
                position: 'top',
                text1: 'PDF Downloaded Successfully!',
                text2: `Saved to: ${retryPdf.filePath}`,
                visibilityTime: 5000,
              });
              return `file://${retryPdf.filePath}`;
            }
          } catch (retryError) {
            console.error('Retry PDF generation error:', retryError);
          }
        }
      }
      
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'PDF Generation Failed',
        text2: 'Unable to generate PDF. Please try again.',
        visibilityTime: 4000,
      });
      
      return null;
    }
  };

  const openPDF = async (pdfPath) => {
    try {
      // Try opening with content:// intent for Android
      const androidPath = pdfPath.startsWith('file://') ? pdfPath : `file://${pdfPath}`;
      await Linking.openURL(androidPath);
    } catch {
      // Fallback: open via share sheet so user can pick a PDF viewer
      try {
        await RNShare.open({
          url: pdfPath.startsWith('file://') ? pdfPath : `file://${pdfPath}`,
          type: 'application/pdf',
          title: 'Open PDF',
        });
      } catch (e) {
        if (!e.message?.includes('User did not share')) {
          Alert.alert('Cannot Open PDF', 'Please open it manually from your Downloads folder.');
        }
      }
    }
  };

  const handleSharePDF = async () => {
    try {
      const pdfPath = await generateBuyerDetailsPDF();
      if (pdfPath) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await RNShare.open({
          title: 'Share Buyer Details',
          message: `Buyer details for ${buyerDetails.personal.fullName}`,
          url: pdfPath,
          type: 'application/pdf',
          subject: `Buyer Details - ${buyerDetails.personal.fullName}`,
          filename: `Buyer_Details_${buyerDetails.personal.fullName.replace(/\s+/g, '_')}.pdf`,
        });
      }
    } catch (error) {
      if (error.message && error.message.includes('User did not share')) return;
      Alert.alert('Share Failed', 'Unable to share buyer details');
    }
  };

  const handlePrint = async () => {
    try {
      const pdfPath = await generateBuyerDetailsPDF();
      if (pdfPath) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await openPDF(pdfPath);
      }
    } catch (error) {
      Alert.alert('Print Failed', 'Unable to open PDF for printing');
    }
  };

  const handleDownload = async () => {
    try {
      const pdfPath = await generateBuyerDetailsPDF();
      if (pdfPath) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await openPDF(pdfPath);
      }
    } catch (error) {
      Alert.alert('Download Failed', 'Unable to open PDF');
    }
  };

  return (
    <View style={{paddingTop: insets.top, flex: 1, backgroundColor: 'white'}}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Logo Header */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
  
        {/* Header */}
        <View style={styles.header}>
          <AppText weight='Inter' style={styles.headline}>LEAD UNLOCKED</AppText>
          <AppText weight='Inter' style={styles.subheader}>Full buyer details now available</AppText>
        </View>

        {/* Contact Action Buttons */}
        {/* <View style={styles.contactActions}>
          <TouchableOpacity 
            style={styles.contactButton} 
            onPress={() => makePhoneCall(buyerDetails.personal.contactNumber)}
          >
            <Icon name="phone" size={24} color="#fff" />
            <AppText weight='Inter' style={styles.contactButtonText}>Call</AppText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.contactButton, styles.whatsappButton]} 
            onPress={() => openWhatsApp(buyerDetails.personal.whatsappNumber)}
          >
            <IconFA name="whatsapp" size={24} color="#fff" />
            <AppText weight='Inter' style={styles.contactButtonText}>WhatsApp</AppText>
          </TouchableOpacity>
        </View> */}

        {/* Selected Items */}
        <View style={styles.itemsContainer}>
          {selectedItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <LinearGradient
                colors={['#f5f5f5', '#ffffff']}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              > 
                <Animated.View style={[styles.serialBadge, { transform: [{ scale: scaleAnim }] }]}>
                  <AppText weight='Inter' style={styles.serialBadgeText}>{item.id}</AppText>
                </Animated.View> 
                <View style={styles.itemGrid}>
                  <View style={styles.itemColumn}>
                    <View style={styles.itemField}>
                      <AppText weight='Inter' style={styles.itemLabel}>COLOR</AppText>
                      <AppText weight='Inter' style={styles.itemValue}>{item.color}</AppText>
                    </View>
                    <View style={styles.itemField}>
                      <AppText weight='Inter' style={styles.itemLabel}>SIZE</AppText> 
                      <AppText weight='Inter' style={styles.itemValue}>
                        {(() => {
                          const [widthStr, heightStr] = item.size.split('x');
                          const width = parseFloat(widthStr);
                          const height = parseFloat(heightStr);
                          return `${width * height} sq ft`;
                        })()}
                      </AppText>
                    </View>
                  </View>
                  
                  <View style={styles.itemColumn}>
                    <View style={styles.itemField}>
                      <AppText weight='Inter' style={styles.itemLabel}>LOCATION</AppText>
                      <AppText weight='Inter' style={styles.itemValue}>{item.where}</AppText>
                    </View>
                    <View style={styles.itemField}>
                      <AppText weight='Inter' style={styles.itemLabel}>QUANTITY</AppText>
                      <AppText weight='Inter' style={styles.itemValue}>{item.qty}</AppText>
                    </View>
                  </View>
                </View>
                
                <View style={styles.totalContainer}>
                  <AppText weight='Inter' style={styles.totalLabel}>TOTAL</AppText>
                  <AppText weight='Inter' style={styles.totalValue}>
                   { parseFloat(item.qty)*parseFloat(item.total)}  
                    </AppText>
                </View>
                
                {item.remarks && (
                  <View style={styles.remarksContainer}>
                    <AppText weight='Inter' style={styles.remarksLabel}>REMARKS</AppText>
                    <AppText weight='Inter' style={styles.remarksValue}>{item.remarks}</AppText>
                  </View>
                )}
              </LinearGradient>
            </View>
          ))}
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Icon name="straighten" size={20} color="#000" style={styles.summaryIcon} />
              <AppText weight='Inter' style={styles.summaryLabel}>TOTAL SQ FT</AppText>
              <AppText weight='Inter' style={styles.summaryValue}>{totalSqFt}</AppText>
            </View>
    
            <View style={styles.summaryItem}>
              <Icon name="format-list-numbered" size={20} color="#000" style={styles.summaryIcon} />
              <AppText weight='Inter' style={styles.summaryLabel}>TOTAL QUANTITY</AppText>
              <AppText weight='Inter' style={styles.summaryValue}>{totalQuantity}</AppText>
            </View>
          </View>
        </View>

        {/* Buyer Details Card */}
        <View style={styles.card}>
          {/* Personal Details Section */}
          <View style={styles.cardHeader}>
            <AppText weight='Inter' style={styles.sectionTitle}>PERSONAL DETAILS</AppText>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="person" size={20} color="#000" style={styles.icon} />
            <View>
              <AppText weight='Inter' style={styles.detailLabel}>Full Name</AppText>
              <AppText weight='Inter' style={styles.detailValue}>{buyerDetails.personal.fullName}</AppText>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="phone" size={20} color="#000" style={styles.icon} />
            <View>
              <AppText weight='Inter' style={styles.detailLabel}>Contact Number</AppText>
              <TouchableOpacity onPress={() => makePhoneCall(buyerDetails.personal.contactNumber)}>
                <AppText weight='Inter' style={[styles.detailValue, styles.linkText]}>
                  {buyerDetails.personal.contactNumber}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="chat" size={20} color="#000" style={styles.icon} />
            <View>
              <AppText weight='Inter' style={styles.detailLabel}>WhatsApp Number</AppText>
              <TouchableOpacity onPress={() => openWhatsApp(buyerDetails.personal.whatsappNumber)}>
                <AppText weight='Inter' style={[styles.detailValue, styles.linkText]}>
                  {buyerDetails.personal.whatsappNumber}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="email" size={20} color="#000" style={styles.icon} />
            <View>
              <AppText weight='Inter' style={styles.detailLabel}>Email Address</AppText>
              <AppText weight='Inter' style={styles.detailValue}>{buyerDetails.personal.email}</AppText>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Project Details Section */}
          <AppText weight='Inter' style={styles.sectionTitle}>PROJECT DETAILS</AppText>
          
          <View style={styles.detailRow}>
            <Icon name="business" size={20} color="#000" style={styles.icon} />
            <View>
              <AppText weight='Inter' style={styles.detailLabel}>Project Name</AppText>
              <AppText weight='Inter' style={styles.detailValue}>{buyerDetails.project.name}</AppText>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="location-on" size={20} color="#000" style={styles.icon} />
            <View>
              <AppText weight='Inter' style={styles.detailLabel}>Project Address</AppText>
              <AppText weight='Inter' style={styles.detailValue1}>{buyerDetails.project.address}</AppText>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="map" size={20} color="#000" style={styles.icon} />
            <View>
              <AppText weight='Inter' style={styles.detailLabel}>Pin Code</AppText>
              <View style={styles.inlineContainer}>
                <AppText weight='Inter' style={styles.detailValue}>{buyerDetails.project.pinCode}</AppText>
                <TouchableOpacity onPress={openMap} style={styles.mapLink}>
                  <AppText weight='Inter' style={styles.linkText}>View on Map</AppText>
                  <Icon name="open-in-new" size={16} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="schedule" size={20} color="#000" style={styles.icon} />
            <View>
              <AppText weight='Inter' style={styles.detailLabel}>Project Stage</AppText>
              <View style={styles.inlineContainer}>
                <AppText weight='Inter' style={styles.detailValue}>{buyerDetails.project.stage}</AppText>
                <AppText weight='Inter' style={styles.timeline}>{buyerDetails.project.timeline}</AppText>
              </View>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="straighten" size={20} color="#000" style={styles.icon} />
            <View>
              <AppText weight='Inter' style={styles.detailLabel}>Total Sq. Feet</AppText>
              <View style={styles.inlineContainer}>
                <AppText weight='Inter' style={styles.detailValue}>{buyerDetails.project.totalSqFt}</AppText>
                <AppText weight='Inter' style={styles.category}>{buyerDetails.project.category}</AppText>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSharePDF}>
            <Icon name="share" size={24} color="#000" />
            <AppText weight='Inter' style={styles.actionText}>Share</AppText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
            <Icon name="print" size={24} color="#000" />
            <AppText weight='Inter' style={styles.actionText}>Print</AppText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
            <Icon name="cloud-download" size={24} color="#000" />
            <AppText weight='Inter' style={styles.actionText}>Download</AppText>
          </TouchableOpacity>
        </View> 
      </ScrollView>
      <Toast />
    </View>
  );
};


// // import React, { useState, useEffect } from 'react';
// import {
//   View, 
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Image,
//   Linking,
//   Share,
//   Alert,
//   Animated,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons'; 
// import LinearGradient from 'react-native-linear-gradient';
// import AppText from '../../components/AppText';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import RNHTMLtoPDF from 'react-native-html-to-pdf'; 

// // const ContactBuyer = ({ route, navigation }) => {
// //   const insets = useSafeAreaInsets();
// //   const { lead } = route.params; 
  
// //   const scaleAnim = useState(new Animated.Value(1))[0];

// //   // Extract buyer details from the lead data
// //   const buyerDetails = {
// //     personal: {
// //       fullName: lead.rawData.contactInfo.name,
// //       contactNumber: lead.rawData.contactInfo.contactNumber,
// //       whatsappNumber: lead.rawData.contactInfo.whatsappNumber,
// //       email: lead.rawData.contactInfo.email,
// //     },
// //     project: {
// //       name: lead.rawData.projectInfo.name,
// //       address: lead.rawData.projectInfo.address,
// //       pinCode: lead.rawData.projectInfo.pincode,
// //       stage: lead.rawData.projectInfo.stage,
// //       timeline: lead.rawData.projectInfo.timeline,
// //       totalSqFt: `${lead.rawData.totalSqft} sq ft`,
// //       category: lead.rawData.category?.name || 'Window',
// //       googleMapLink: lead.rawData.projectInfo.googleMapLink,
// //     },
// //   };

// //   // Format quotes as selected items
// //   const selectedItems = lead.rawData.quotes.map((quote, index) => ({
// //     id: index + 1,
// //     design: quote.product.title,
// //     color: quote.color,
// //     size: `${quote.width}ft x ${quote.height}ft`,
// //     where: quote.installationLocation.replace(/_/g, ' '),
// //     qty: quote.quantity,
// //     total: `${quote.sqft} sq ft`,
// //     remarks: quote.remark || 'No remarks',
// //   }));

// //   // Calculate totals
// //   const totalSqFt = lead.rawData.totalSqft;
// //   const totalQuantity = lead.rawData.totalQuantity;

// //   const generatePDF = async () => {
// //   try {
// //     const htmlContent = `
// //       <html>
// //         <head>
// //           <style>
// //             body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
// //             h2 { text-align: center; }
// //             table { width: 100%; border-collapse: collapse; margin-top: 20px; }
// //             th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
// //             th { background-color: #f2f2f2; }
// //           </style>
// //         </head>
// //         <body>
// //           <h2>Buyer Details</h2>
// //           <table>
// //             <tr>
// //               <th colspan="2">Personal Information</th>
// //             </tr>
// //             <tr><td>Full Name</td><td>${buyerDetails.personal.fullName}</td></tr>
// //             <tr><td>Contact Number</td><td>${buyerDetails.personal.contactNumber}</td></tr>
// //             <tr><td>Email</td><td>${buyerDetails.personal.email}</td></tr>
// //             <tr><td>WhatsApp Number</td><td>${buyerDetails.personal.whatsappNumber}</td></tr>

// //             <tr>
// //               <th colspan="2">Project Information</th>
// //             </tr>
// //             <tr><td>Project Name</td><td>${buyerDetails.project.name}</td></tr>
// //             <tr><td>Category</td><td>${buyerDetails.project.category}</td></tr>
// //             <tr><td>Address</td><td>${buyerDetails.project.address}, ${buyerDetails.project.pinCode}</td></tr>
// //             <tr><td>Google Map Link</td><td>${buyerDetails.project.googleMapLink}</td></tr>
// //             <tr><td>Stage</td><td>${buyerDetails.project.stage}</td></tr>
// //             <tr><td>Timeline</td><td>${buyerDetails.project.timeline}</td></tr>
// //             <tr><td>Total Area</td><td>${buyerDetails.project.totalSqFt}</td></tr>
// //           </table>
// //         </body>
// //       </html>
// //     `;

// //     const options = {
// //       html: htmlContent,
// //       fileName: `Buyer_Details_${buyerDetails.personal.fullName}`,
// //       directory: 'Documents',
// //     };

// //     const file = await RNHTMLtoPDF.convert(options);
// //     return file.filePath; // Path of the generated PDF
// //   } catch (err) {
// //     console.error(err);
// //     Alert.alert('Error', 'Failed to generate PDF');
// //   }
// // };
 
// //   const handleSharePDF = async () => {
// //   try {
// //     const filePath = await generatePDF();
// //     if (filePath) {
// //       await Share.share({
// //         url: `file://${filePath}`,
// //         title: 'Buyer Details PDF',
// //       });
// //     }
// //   } catch (err) {
// //     Alert.alert('Error', 'Failed to share PDF');
// //   }
// // };


// //   const handlePrint = () => {
// //     Alert.alert('Print', 'Print functionality would connect to a printer in production');
// //   };

// //   const handleDownload = () => {
// //     Alert.alert('Download', 'Details would be downloaded as PDF in production');
// //   };

// //   const openMap = () => {
// //     const mapUrl = buyerDetails.project.googleMapLink || 
// //                   `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(buyerDetails.project.address)}`;
// //     Linking.openURL(mapUrl);
// //   };
 
// //   return (
// //     <View style={{paddingTop: insets.top, flex: 1, backgroundColor: 'white'}}>
// //       <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
// //         {/* Logo Header */}
// //         <View style={styles.logoContainer}>
// //           <Image
// //             source={require('../../assets/logo.png')}
// //             style={styles.logo}
// //             resizeMode="contain"
// //           />
// //         </View>
  
// //         {/* Header */}
// //         <View style={styles.header}>
// //           <AppText weight='Inter' style={styles.headline}>LEAD UNLOCKED</AppText>
// //           <AppText weight='Inter' style={styles.subheader}>Full buyer details now available</AppText>
       
// //         </View>

// //         {/* Selected Items */}
// //         <View style={styles.itemsContainer}>
// //           {selectedItems.map((item) => (
// //             <View key={item.id} style={styles.itemCard}>
// //               <LinearGradient
// //                 colors={['#f5f5f5', '#ffffff']}
// //                 style={styles.cardGradient}
// //                 start={{ x: 0, y: 0 }}
// //                 end={{ x: 1, y: 1 }}
// //               > 
// //                 <Animated.View style={[styles.serialBadge, { transform: [{ scale: scaleAnim }] }]}>
// //                   <AppText weight='Inter' style={styles.serialBadgeText}>{item.id}</AppText>
// //                 </Animated.View> 
// //                 <View style={styles.itemGrid}>
// //                   <View style={styles.itemColumn}>
// //                     <View style={styles.itemField}>
// //                       <AppText weight='Inter' style={styles.itemLabel}>COLOR</AppText>
// //                       <AppText weight='Inter' style={styles.itemValue}>{item.color}</AppText>
// //                     </View>
// //                     <View style={styles.itemField}>
// //                       <AppText weight='Inter' style={styles.itemLabel}>SIZE</AppText> 
// //                       <AppText weight='Inter' style={styles.itemValue}>
// //                         {(() => {
// //                           const [widthStr, heightStr] = item.size.split('x');
// //                           const width = parseFloat(widthStr);
// //                           const height = parseFloat(heightStr);
// //                           return `${width * height} sq ft`;
// //                         })()}
// //                       </AppText>

// //                     </View>
// //                   </View>
                  
// //                   <View style={styles.itemColumn}>
// //                     <View style={styles.itemField}>
// //                       <AppText weight='Inter' style={styles.itemLabel}>LOCATION</AppText>
// //                       <AppText weight='Inter' style={styles.itemValue}>{item.where}</AppText>
// //                     </View>
// //                     <View style={styles.itemField}>
// //                       <AppText weight='Inter' style={styles.itemLabel}>QUANTITY</AppText>
// //                       <AppText weight='Inter' style={styles.itemValue}>{item.qty}</AppText>
// //                     </View>
// //                   </View>
// //                 </View>
                
// //                 <View style={styles.totalContainer}>
// //                   <AppText weight='Inter' style={styles.totalLabel}>TOTAL</AppText>
// //                   <AppText weight='Inter' style={styles.totalValue}>
// //                    { parseFloat(item.qty)*parseFloat(item.total)}  
// //                     </AppText>
// //                 </View>
                
// //                 {item.remarks && (
// //                   <View style={styles.remarksContainer}>
// //                     <AppText weight='Inter' style={styles.remarksLabel}>REMARKS</AppText>
// //                     <AppText weight='Inter' style={styles.remarksValue}>{item.remarks}</AppText>
// //                   </View>
// //                 )}
// //               </LinearGradient>
// //             </View>
// //           ))}
          
// //           <View style={styles.summaryCard}>
// //             <View style={styles.summaryItem}>
// //               <Icon name="straighten" size={20} color="#000" style={styles.summaryIcon} />
// //               <AppText weight='Inter' style={styles.summaryLabel}>TOTAL SQ FT</AppText>
// //               <AppText weight='Inter' style={styles.summaryValue}>{totalSqFt}</AppText>
// //             </View>
    
// //             <View style={styles.summaryItem}>
// //               <Icon name="format-list-numbered" size={20} color="#000" style={styles.summaryIcon} />
// //               <AppText weight='Inter' style={styles.summaryLabel}>TOTAL QUANTITY</AppText>
// //               <AppText weight='Inter' style={styles.summaryValue}>{totalQuantity}</AppText>
// //             </View>
// //           </View>
// //         </View>

// //         {/* Buyer Details Card */}
// //         <View style={styles.card}>
// //           {/* Personal Details Section */}
// //           <View style={styles.cardHeader}>
// //             <AppText weight='Inter' style={styles.sectionTitle}>PERSONAL DETAILS</AppText>
// //           </View>
          
// //           <View style={styles.detailRow}>
// //             <Icon name="person" size={20} color="#000" style={styles.icon} />
// //             <View>
// //               <AppText weight='Inter' style={styles.detailLabel}>Full Name</AppText>
// //               <AppText weight='Inter' style={styles.detailValue}>{buyerDetails.personal.fullName}</AppText>
// //             </View>
// //           </View>

// //           <View style={styles.detailRow}>
// //             <Icon name="phone" size={20} color="#000" style={styles.icon} />
// //             <View>
// //               <AppText weight='Inter' style={styles.detailLabel}>Contact Number</AppText>
// //               <AppText weight='Inter' style={styles.detailValue}>{buyerDetails.personal.contactNumber}</AppText>
// //             </View>
// //           </View>

// //           <View style={styles.detailRow}>
// //             <Icon name="chat" size={20} color="#000" style={styles.icon} />
// //             <View>
// //               <AppText weight='Inter' style={styles.detailLabel}>WhatsApp Number</AppText>
// //               <AppText weight='Inter' style={styles.detailValue}>{buyerDetails.personal.whatsappNumber}</AppText>
// //             </View>
// //           </View>

// //           <View style={styles.detailRow}>
// //             <Icon name="email" size={20} color="#000" style={styles.icon} />
// //             <View>
// //               <AppText weight='Inter' style={styles.detailLabel}>Email Address</AppText>
// //               <AppText weight='Inter' style={styles.detailValue}>{buyerDetails.personal.email}</AppText>
// //             </View>
// //           </View>

// //           {/* Divider */}
// //           <View style={styles.divider} />

// //           {/* Project Details Section */}
// //           <AppText weight='Inter' style={styles.sectionTitle}>PROJECT DETAILS</AppText>
          
// //           <View style={styles.detailRow}>
// //             <Icon name="business" size={20} color="#000" style={styles.icon} />
// //             <View>
// //               <AppText weight='Inter' style={styles.detailLabel}>Project Name</AppText>
// //               <AppText weight='Inter' style={styles.detailValue}>{buyerDetails.project.name}</AppText>
// //             </View>
// //           </View>

// //           <View style={styles.detailRow}>
// //             <Icon name="location-on" size={20} color="#000" style={styles.icon} />
// //             <View>
// //               <AppText weight='Inter' style={styles.detailLabel}>Project Address</AppText>
// //               <AppText weight='Inter' style={styles.detailValue1}>{buyerDetails.project.address}</AppText>
// //             </View>
// //           </View>

// //           <View style={styles.detailRow}>
// //             <Icon name="map" size={20} color="#000" style={styles.icon} />
// //             <View>
// //               <AppText weight='Inter' style={styles.detailLabel}>Pin Code</AppText>
// //               <View style={styles.inlineContainer}>
// //                 <AppText weight='Inter' style={styles.detailValue}>{buyerDetails.project.pinCode}</AppText>
// //                 <TouchableOpacity onPress={openMap} style={styles.mapLink}>
// //                   <AppText weight='Inter' style={styles.linkText}>View on Map</AppText>
// //                   <Icon name="open-in-new" size={16} color="#000" />
// //                 </TouchableOpacity>
// //               </View>
// //             </View>
// //           </View>

// //           <View style={styles.detailRow}>
// //             <Icon name="schedule" size={20} color="#000" style={styles.icon} />
// //             <View>
// //               <AppText weight='Inter' style={styles.detailLabel}>Project Stage</AppText>
// //               <View style={styles.inlineContainer}>
// //                 <AppText weight='Inter' style={styles.detailValue}>{buyerDetails.project.stage}</AppText>
// //                 <AppText weight='Inter' style={styles.timeline}>{buyerDetails.project.timeline}</AppText>
// //               </View>
// //             </View>
// //           </View>

// //           <View style={styles.detailRow}>
// //             <Icon name="straighten" size={20} color="#000" style={styles.icon} />
// //             <View>
// //               <AppText weight='Inter' style={styles.detailLabel}>Total Sq. Feet</AppText>
// //               <View style={styles.inlineContainer}>
// //                 <AppText weight='Inter' style={styles.detailValue}>{buyerDetails.project.totalSqFt}</AppText>
// //                 <AppText weight='Inter' style={styles.category}>{buyerDetails.project.category}</AppText>
// //               </View>
// //             </View>
// //           </View>
// //         </View>

// //         {/* Action Buttons */}
// //         <View style={styles.actionRow}>
// //           <TouchableOpacity style={styles.actionButton} onPress={handleSharePDF}>
// //             <Icon name="share" size={24} color="#000" />
// //             <AppText weight='Inter' style={styles.actionText}>Share</AppText>
// //           </TouchableOpacity>

// //           <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
// //             <Icon name="print" size={24} color="#000" />
// //             <AppText weight='Inter' style={styles.actionText}>Print</AppText>
// //           </TouchableOpacity>

// //           <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
// //             <Icon name="cloud-download" size={24} color="#000" />
// //             <AppText weight='Inter' style={styles.actionText}>Download</AppText>
// //           </TouchableOpacity>
// //         </View> 
// //       </ScrollView>
// //     </View>
// //   );
// // };

const styles = StyleSheet.create({
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  contactButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  linkText: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff', 
  }, 
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 50,
  },
  animation: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 10,
  },
  header: {
    alignItems: 'center', 
    paddingHorizontal: 20,
  },
  headline: {
    fontSize: 18, 
    color: '#000',
    letterSpacing: 1,
    marginBottom: 5,
  },
  subheader: {
    fontSize: 14,
    color: '#666', 
  },
  cardHeader:{
    flexDirection:'row',
    alignItems:"center",
    justifyContent:"space-between"
  },
  cardTitle: {
    fontSize: 16, 
    color: '#000',
    letterSpacing: 0.5,
  },
  editButton: {
    padding: 5,
  },
  itemGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemColumn: {
    width: '48%',
  },
  itemField: {
    marginBottom: 12,
  },
  itemLabel: {
    fontSize: 10, 
    color: '#666',
    marginBottom: 2,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  itemValue: {
    fontSize: 14,
    // fontWeight: '500',
    color: '#000',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  totalLabel: {
    fontSize: 14,
    // fontWeight: '700',
    color: '#000',
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 16,
    // fontWeight: '800',
    color: '#000',
  },
  remarksContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  remarksLabel: {
    fontSize: 12,
    // fontWeight: '600',
    color: '#666',
    marginBottom: 2,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  remarksValue: {
    fontSize: 13,
    // fontWeight: '500',
    color: '#000',
    fontStyle: 'italic',
  },
// Summary Card
summaryCard: {
  backgroundColor:"white",
  flexDirection:"row",
  padding:20,
  borderWidth: 1,
  borderColor: 'rgba(0,0,0,0.05)',
  marginTop: 20,
  borderRadius: 12,
  overflow: 'hidden',
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    android: {
      elevation: 4,
    },
  }),
},
summaryGradient: {
  padding: 15,
},
summaryRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
summaryItem: {
  flex: 1,
  alignItems: 'center',
},
summaryDivider: {
  width: 1,
  height: 40,
  backgroundColor: 'rgba(0,0,0,0.1)',
},
summaryLabel: {
  fontSize: 12,
  // fontWeight: '600',
  color: '#666',
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  marginBottom: 5,
},
summaryValue: {
  fontSize: 18,
  // fontWeight: '700',
  color: '#000',
},
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 25,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    // fontWeight: '800',
    color: '#000',
    marginBottom: 20,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  viewTitle: { 
    backgroundColor:"black",
    color: 'white',
    padding:10,
    marginTop: 20,
    marginHorizontal:10,
    paddingHorizontal:15,
    textDecorationLine:"underline",
    // borderBottomWidth:1,
    // borderBottomColor:"black",
    // borderBottomColor:'black', 
    borderRadius:20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  icon: {
    marginRight: 15,
    marginTop: 3,
  },
  detailLabel: {
    fontSize: 12,
    // fontWeight: '700',
    color: '#666',
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    // fontWeight: '600',
    color: '#000',
  },
  detailValue1: {
    fontSize: 14,
    // fontWeight: '600',
    color: '#000',
    marginRight:30,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 20,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  linkText: {
    fontSize: 14,
    // fontWeight: '600',
    color: '#000',
    marginRight: 5,
    textDecorationLine: 'underline',
  },
  timeline: {
    fontSize: 14,
    // fontWeight: '600',
    color: '#000',
    marginLeft: 15,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  category: {
    fontSize: 14,
    // fontWeight: '700',
    color: '#000',
    marginLeft: 15,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 25,
  },
  actionButton: {
    alignItems: 'center',
    padding: 10,
  },
  actionText: {
    fontSize: 14,
    // fontWeight: '600',
    color: '#000',
    marginTop: 5,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  callButton: {
    backgroundColor: '#000',
  },
  whatsappButton: {
    backgroundColor: '#000',
  },
  contactButtonText: {
    fontSize: 16,
    // fontWeight: '700',
    color: '#fff',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 10,
    flex: 1,
  },
  itemsContainer: {
    marginBottom: 15,
    padding:20,
  },
    itemCard: {
      borderRadius: 14,
      marginBottom: 15,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    cardGradient: {
    padding: 20,
  },
serialBadge: {
  backgroundColor: '#000',
  width: 24,
  height: 24,
  borderRadius: 12,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 10,
  marginBottom: 10,
},
serialBadgeText: {
  color: '#fff',
  // fontWeight: 'bold',
  fontSize: 12,
},
});

export default ContactBuyer;