import Settings from '../model/Settings.js';

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
      await settings.save();
    }
    return res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateSettings = async (req, res) => {
  const { paymentGateways, ...otherSettings } = req.body;
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }
    
    // Whitelist and assign standard settings
    Object.assign(settings, otherSettings);

    // Restrict paymentGateways settings update to super_admin role
    if (paymentGateways !== undefined) {
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ success: false, message: 'Only super_admin can modify payment gateway settings.' });
      }
      settings.paymentGateways = {
        ...settings.paymentGateways,
        ...paymentGateways
      };
    }

    await settings.save();
    return res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
